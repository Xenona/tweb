import type { Canvaser } from "./Canvaser";
import { MouseEv, MouseMoveEv } from "./Mouse";
import { RenderCtx } from "./Renderer";

export class BaseTool {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser
  }

  public render(ctx: RenderCtx) {
    this.canvaser.render(ctx)
  }

  public update() {}

  public mouseMove(ev: MouseMoveEv) {}

  public mouseUpDown(ev: MouseEv) {}

  protected canvaser: Canvaser
}

export class NoneTool extends BaseTool {} 