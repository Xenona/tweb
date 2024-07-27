import type {Canvaser} from './Canvaser';
import {MouseEv, MouseMoveEv} from './Mouse';
import {IDrawable, RenderCtx} from './Renderer';

export enum LayerPriority {
  Background = 0,
  Drawing = 1,
  Stickers = 2,
}

export class Layer implements IDrawable {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
  }

  render(ctx: RenderCtx) {}

  public mouseMove(ev: MouseMoveEv) {}
  public mouseUpDown(ev: MouseEv) {}

  public shouldFocus(ev: MouseEv) {
    return false;
  }

  public get priority() {
    return LayerPriority.Background;
  }

  protected canvaser: Canvaser;
}
