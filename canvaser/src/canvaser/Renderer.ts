import { Mat3 } from "./Mat";

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

    this.curTransform = Mat3.identity();
    this.transformStack = []
  }

  public setSize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;

    this.transformStack = [];
    this.curTransform = Mat3.identity().translate(w / 2, h / 2);
    this.ctx.setTransform(...this.curTransform.toCanvas())

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

  public pushTransform(t: Transformation | Mat3) {
    this.transformStack.push(this.curTransform);
    if(t instanceof Mat3) {
      this.curTransform = this.curTransform.multiply(t);
    } else {
      this.curTransform = this.curTransform.translate(t.x ?? 0, t.y ?? 0);

      if (t.rotate) this.curTransform = this.curTransform.rotate(t.rotate);
    }

    this.ctx.setTransform(...this.curTransform.toCanvas());
  }

  public popTransform() {
    this.curTransform = this.transformStack.pop() ?? this.curTransform;
    this.ctx.setTransform(...this.curTransform.toCanvas());
  }

  public withTransform(t: Transformation, cb: () => void) {
    this.pushTransform(t);
    cb();
    this.popTransform();
  }

  public draw(drawable: IDrawable) {
    drawable.render(this);
  }

  public drawImage(image: HTMLImageElement | OffscreenCanvas) {
    let w: number, h: number;

    if (image instanceof HTMLImageElement) {
      w = image.naturalWidth;
      h = image.naturalHeight;
    } else {
      w = image.width;
      h = image.height;
    }

    this.ctx.drawImage(
      image,
      -w / 2,
      -h / 2
    );
  }

  public with2D(cb: (ctx: CanvasRenderingContext2D) => void) {
    this.ctx.save();
    cb(this.ctx);
    this.ctx.restore();
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

  private curTransform: Mat3 = Mat3.identity();
  private transformStack: Mat3[] = [];
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
