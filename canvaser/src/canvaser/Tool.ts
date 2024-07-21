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

  public mouseMove(ev: MouseMoveEv) {
    this.canvaser.focusedLayer?.mouseMove(ev);
  }

  public mouseUpDown(ev: MouseEv) {
    if(ev.pressed)
      this.canvaser.tryFocusLayer(ev);
    this.canvaser.focusedLayer?.mouseUpDown(ev);
  }

  protected canvaser: Canvaser
}

export class NoneTool extends BaseTool {} 