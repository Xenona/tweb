export interface IDrawable {
  render(ctx: RenderCtx): void;
}

export type Transformation = {
  x?: number;
  y?: number;
  rotate?: number;
};

export class RenderCtx {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.filterStack = [];
  }

  public setSize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;

    this.ctx.resetTransform();
    this.ctx.translate(w / 2, h / 2);

    this.updateIFactor();
  }

  public pushFilters(filters: string) {
    this.filterStack.push(this.ctx.filter);

    if (this.ctx.filter == "none") this.ctx.filter = filters;
    else this.ctx.filter += ` ${filters}`;
  }

  public popFilters() {
    this.ctx.filter = this.filterStack.pop() || "";
  }

  public pushTransform(t: Transformation) {
    this.ctx.save();
    this.ctx.translate(t.x ?? 0, t.y ?? 0);

    if (t.rotate) this.ctx.rotate(t.rotate);
  }

  public popTransform() {
    this.ctx.restore();
  }

  public withTransform(t: Transformation, cb: () => void) {
    this.pushTransform(t);
    cb();
    this.popTransform();
  }

  public draw(drawable: IDrawable) {
    drawable.render(this);
  }

  public drawImage(image: HTMLImageElement) {
    this.ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2
    );
  }

  public with2D(cb: (ctx: CanvasRenderingContext2D) => void) {
    cb(this.ctx);
  }

  public updateIFactor(): boolean {
    const prevIFactor = this.iFactor;
    this.iFactor = this.canvas.width / this.canvas.getBoundingClientRect().width;

    return prevIFactor != this.iFactor;
  }

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private filterStack: string[];

  public iFactor: number = 1;
}

export class Rect implements IDrawable {
  constructor() {
    this.cx = 0;
    this.cy = 0;
    this.w = 0;
    this.h = 0;
  }

  public setPoints(x1: number, y1: number, x2: number, y2: number) {
    this.cx = (x1 + x2) / 2;
    this.cy = (y1 + y2) / 2;
    this.w = Math.abs(x1 - x2);
    this.h = Math.abs(y1 - y2);
  }

  public render(ctx: RenderCtx) {
    ctx.withTransform({ x: this.cx, y: this.cy }, () => {
      this.renderBase(ctx);
    });

    const hw = this.w / 2;
    const hh = this.h / 2;

    for (const [x, y, a] of [
      [-hw, -hh, 0],
      [hw, -hh, Math.PI / 2],
      [hw, hh, Math.PI],
      [-hw, hh, (Math.PI / 2) * 3],
    ]) {
      ctx.withTransform({ x: x + this.cx, y: y + this.cy, rotate: a }, () => {
        this.renderAngle(ctx);
      });
    }
  }

  protected renderBase(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.strokeStyle = "red";
      c.lineWidth = 5;
      c.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
    });
  }

  protected renderAngle(ctx: RenderCtx) {}

  protected cx: number;
  protected cy: number;
  protected w: number;
  protected h: number;
}
