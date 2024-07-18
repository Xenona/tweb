import type { Canvaser } from "./Canvaser";
import { IDrawable, RenderCtx } from "./Renderer";

export class Layer implements IDrawable {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
  }
  
  render(ctx: RenderCtx) {}

  protected canvaser: Canvaser;
}