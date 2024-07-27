import {IDrawable, RenderCtx} from './Renderer';

export type Rect = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  angle: number;
};

export class DrawableRect implements IDrawable {
  constructor() {
    this.o = {
      cx: 0,
      cy: 0,
      w: 0,
      h: 0,
      angle: 0
    };
  }

  public setRect(o: Rect) {
    this.o = {...o};
  }

  public setPoints(x1: number, y1: number, x2: number, y2: number) {
    this.o.cx = (x1 + x2) / 2;
    this.o.cy = (y1 + y2) / 2;
    this.o.w = Math.abs(x1 - x2);
    this.o.h = Math.abs(y1 - y2);
  }

  public render(ctx: RenderCtx) {
    ctx.withTransform({x: this.o.cx, y: this.o.cy, rotate: this.o.angle}, () => {
      this.renderBase(ctx);

      const hw = this.o.w / 2;
      const hh = this.o.h / 2;

      for(const [x, y, a] of [
        [-hw, -hh, 0],
        [hw, -hh, Math.PI / 2],
        [hw, hh, Math.PI],
        [-hw, hh, (Math.PI / 2) * 3]
      ]) {
        ctx.withTransform({x, y, rotate: a}, () => {
          this.renderAngle(ctx);
        });
      }
    });
  }

  protected renderBase(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.strokeStyle = 'red';
      c.lineWidth = 5;
      c.strokeRect(-this.o.w / 2, -this.o.h / 2, this.o.w, this.o.h);
    });
  }

  protected renderAngle(ctx: RenderCtx) {}

  protected o: Rect;
}
