import type { Canvaser } from "./Canvaser";
import { HistoryValueHelper } from "./History";
import { RenderCtx } from "./Renderer";

export type EffectInfo = {
  type: "scalar";
  min: number;
  max: number;
  default: number;
};

class RootScalarEffect {
  constructor(effects: RootEffects, info: Omit<EffectInfo, "type">) {
    this.effects = effects;
    this.effectInfo = {
      type: "scalar",
      ...info,
    };
  }

  public setValue(val: number) {
    this.value = val;

    this.effects.effectUpdate();
  }

  public preEffect(ctx: RenderCtx) {}
  public postEffect(ctx: RenderCtx) {}
  public emitFilter(): string {
    return "";
  }

  public getState(): any {
    return this.value;
  }

  public setState(v: any) {
    this.value = v;
    this.effects.effectUpdate();
  }

  public getInfo(): EffectInfo {
    return this.effectInfo;
  }

  protected effects: RootEffects;
  protected effectInfo: EffectInfo;
  protected value: number = 0;
}

class FilterEffect extends RootScalarEffect {
  constructor(
    effects: RootEffects,
    filter: (v: number) => string,
    info: Omit<EffectInfo, "type">
  ) {
    super(effects, info);

    this.filter = filter;
  }

  public emitFilter(): string {
    return this.filter(this.value);
  }

  public filter: (v: number) => string;
}
type CompositionEffectFilter =  (v: number, c: CanvasRenderingContext2D) => {
  compositeMode: GlobalCompositeOperation;
  color: string | CanvasGradient;
};

class CompositionEffect extends RootScalarEffect {
  
  constructor(
    effects: RootEffects,
    filter: CompositionEffectFilter,
    info: Omit<EffectInfo, "type">
  ) {
    super(effects, info);

    this.filter = filter;
  }

  public postEffect(ctx: RenderCtx) {
    if (
      Math.abs(this.value - this.effectInfo.default) /
        (this.effectInfo.max - this.effectInfo.min) <
      0.01
    )
      return;

      
    ctx.with2D((c) => {
      const p = this.filter(this.value, c);
      
      c.globalCompositeOperation = p.compositeMode;
      c.fillStyle = p.color;
      const w = c.canvas.width;
      const h = c.canvas.height;
      // console.log(p.color); //
      c.fillRect(-w / 2, -h / 2, w, h);
    });

    // return this.filter(this.value).compositeMode;
  }

  public filter: CompositionEffectFilter;
}

class SharpenEffect extends RootScalarEffect {
  
  constructor(
    effects: RootEffects,
    filter: CompositionEffectFilter,
    info: Omit<EffectInfo, "type">
  ) {
    super(effects, info);

    this.filter = filter;
  }

  public postEffect(ctx: RenderCtx) {
    if (
      Math.abs(this.value - this.effectInfo.default) /
        (this.effectInfo.max - this.effectInfo.min) <
      0.01
      )
    return;

    const f = ctx.copyLast();
      
    ctx.with2D((c) => {
      const p = this.filter(this.value, c);
      
      c.globalCompositeOperation = p.compositeMode;
      // c.fillStyle = p.color;
      c.filter = 'blur(4px) invert(1) contrast(0.75)'
      const w = c.canvas.width;
      const h = c.canvas.height;
      // console.log(p.color); //
      c.fillRect(-w / 2, -h / 2, w, h);
      
    });
    f.dispose();

    // return this.filter(this.value).compositeMode;
  }

  public filter: CompositionEffectFilter;
}

export class RootEffects {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;

    this.blur = new FilterEffect(this, (v) => `blur(${v}px)`, {
      min: 0,
      max: 20,
      default: 0,
    });
    this.brightness = new FilterEffect(this, (v) => `brightness(${v + 100}%)`, {
      min: -100,
      max: 100,
      default: 0,
    });
    this.contrast = new FilterEffect(this, (v) => `contrast(${v + 100}%)`, {
      min: -100,
      max: 100,
      default: 0,
    });
    this.saturate = new FilterEffect(this, (v) => `saturate(${v + 100}%)`, {
      min: -100,
      max: 100,
      default: 0,
    });
    this.grayscale = new FilterEffect(this, (v) => `grayscale(${v}%)`, {
      min: 0,
      max: 100,
      default: 0,
    });
    this.warmth = new CompositionEffect(
      this,
      (v) => {
        if (v > 0)
          return {
            compositeMode: "soft-light",
            color: `rgba(255, 0, 0, ${v / 100})`,
          };
        else
          return {
            compositeMode: "soft-light",
            color: `rgba(0, 0, 255, ${-v / 100})`,
          };
      },
      {
        min: -100,
        max: 100,
        default: 0,
      }
    );

    this.fade = new CompositionEffect(
      this,
      (v) => ({
        compositeMode: "soft-light",
        color: `rgba(255, 255, 255, ${v / 100})`,
      }),
      {
        min: 0,
        max: 100,
        default: 0,
      }
    );

    this.shadows = new CompositionEffect(
      this,
      (v) => (v > 0 ? {
        compositeMode: "overlay",
        color: `rgba(240, 240, 240, ${v / 100})`,
      } : {
        compositeMode: "overlay",
        color: `rgba(16, 16, 16, ${-v / 100})`,
      }),
      {
        min: -100,
        max: 100,
        default: 0,
      }
    );
    
    this.highlights = new CompositionEffect(
      this,
      (v) => (v > 0 ? {
        compositeMode: "overlay",
        color: `rgba(255, 255, 255, ${v / 100})`,
      } : {
        compositeMode: "hard-light",
        color: `rgba(16, 16, 16, ${-v / 100})`,
     
      }),
      {
        min: -100,
        max: 100,
        default: 0,
      }
    );

    this.vignette = new CompositionEffect(
      this,
      (v, ctx) => {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const r = Math.min(w, h)
        const grad = ctx.createRadialGradient(0, 0, (100 - v) / 100 * r, 0, 0, r)
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)')
        return {
        compositeMode: "source-atop",
        color: grad,
      }},
      {
        min: 0,
        max: 100,
        default: 0,
      }
    );

    this.sharpen = new SharpenEffect(
      this,
      (v) => ({
        compositeMode: "overlay",
        color: `rgba(255, 255, 255, ${v / 100})`,
      }),
      {
        min: 0,
        max: 100,
        default: 0,
      }
    );

    



    this.hist = new HistoryValueHelper(
      canvaser,
      () => this.getEffects().map((e) => e.getState()),
      (s) => this.getEffects().map((e, i) => e.setState(s[i]))
    );
  }

  public apply(ctx: RenderCtx) {
    const filterStr = this.getEffects()
      .map((e) => {
        e.preEffect(ctx);
        return e.emitFilter();
      })
      .join(" ");

    ctx.pushFilters(filterStr);
  }

  public finish(ctx: RenderCtx) {
    ctx.popFilters();

    this.getEffects().forEach((e) => e.postEffect(ctx));
  }

  public effectUpdate() {
    this.canvaser.emitUpdate();
  }

  private getEffects(): RootScalarEffect[] {
    return [
      this.brightness,
      this.contrast,
      this.saturate,
      this.warmth,
      this.grayscale,
      this.blur,
      this.fade,
      this.shadows,
      this.highlights,
      this.vignette,
      this.sharpen
    ];
  }

  public finishEdit() {
    this.hist.emitHistory();
  }

  private canvaser: Canvaser;

  private hist: HistoryValueHelper<any[]>;

  public contrast: RootScalarEffect;
  public brightness: RootScalarEffect;
  public blur: RootScalarEffect;
  public grayscale: RootScalarEffect;
  public saturate: RootScalarEffect;
  public warmth: RootScalarEffect;
  public fade: RootScalarEffect;
  public shadows: RootScalarEffect;
  public highlights: RootScalarEffect;
  public vignette: RootScalarEffect;
  public sharpen: SharpenEffect;
}
