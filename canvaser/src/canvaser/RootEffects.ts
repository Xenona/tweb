import type { Canvaser } from "./Canvaser";
import { RenderCtx } from "./Renderer";

export type EffectInfo = {
  type: "scalar";
  min: number;
  max: number;
  default: number;
};

class RootScalarEffect {
  constructor(effects: RootEffects, info: Omit<EffectInfo, 'type'>) {
    this.effects = effects;
    this.effectInfo = {
      type: "scalar",
      ...info
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

export class RootEffects {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;

    this.blur = new FilterEffect(this, (v) => `blur(${v}px)`, {
      min: 0,
      max: 20,
      default: 0
    });
    this.brightness = new FilterEffect(this, (v) => `brightness(${v + 100}%)`, {
      min: -100,
      max: 100,
      default: 0
    });
    this.contrast = new FilterEffect(this, (v) => `contrast(${v + 100}%)`, {
      min: -100,
      max: 100,
      default: 0
    });
    this.grayscale = new FilterEffect(this, (v) => `grayscale(${v}%)`, {
      min: 0,
      max: 100,
      default: 0
    });

    this.lastState = this.getStates();
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
    return [this.blur, this.brightness, this.contrast, this.grayscale];
  }

  private getStates(): any[] {
    return this.getEffects().map((e) => e.getState());
  }

  private setStates(states: any[]) {
    this.getEffects().map((e, i) => e.setState(states[i]));
    this.lastState = states;
  }

  public finishEdit() {
    const prevState = this.lastState;
    const newState = this.getStates();

    this.canvaser.emitHistory({
      undo: () => this.setStates(prevState),
      redo: () => this.setStates(newState),
    });

    this.lastState = newState;
  }

  private canvaser: Canvaser;

  private lastState: any[];

  public contrast: RootScalarEffect;
  public brightness: RootScalarEffect;
  public blur: RootScalarEffect;
  public grayscale: RootScalarEffect;
}
