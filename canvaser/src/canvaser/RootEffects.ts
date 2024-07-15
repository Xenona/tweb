import type { Canvaser } from "./Canvaser";
import { RenderCtx } from "./Renderer";

class RootScalarEffect {
  constructor(effects: RootEffects) {
    this.effects = effects;
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

  protected effects: RootEffects;
  protected value: number = 0;
}

class FilterEffect extends RootScalarEffect {
  constructor(filter: (v: number) => string, effects: RootEffects) {
    super(effects);

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

    this.blur = new FilterEffect((v) => `blur(${v}px)`, this);
    this.brightness = new FilterEffect((v) => `brightness(${v + 100}%)`, this);
    this.contrast = new FilterEffect((v) => `contrast(${v + 100}%)`, this);
    this.grayscale = new FilterEffect((v) => `grayscale(${v}%)`, this);

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
