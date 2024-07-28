import {Mat3} from './Mat';

export interface IDrawable {
  render(ctx: RenderCtx): void;
}

export type Transformation = {
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  flip?: boolean
};

export type DrawableImages = HTMLImageElement | OffscreenCanvas | ImageBitmap;

export function getDrawableImageSize(i: DrawableImages): [number, number] {
  if(i instanceof HTMLImageElement) {
    return [i.naturalWidth, i.naturalHeight];
  } else {
    return [i.width, i.height];
  }
}

export class SavedFrame {
  constructor(b: ImageBitmap) {
    this.b = b;
  }

  public dispose() {
    this.b.close();
  }

  public getInternal(): ImageBitmap {
    return this.b;
  }

  private b: ImageBitmap;
}

export class RenderCtx {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.filterStack = [];

    this.curTransform = Mat3.identity();
    this.transformStack = [];

    this.copyHelper = new OffscreenCanvas(100, 100);
    // @ts-ignore
    this.copyHelperCtx = this.copyHelper.getContext('2d');
  }

  public setSize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.copyHelper.width = w;
    this.copyHelper.height = h;

    this.transformStack = [];
    this.curTransform = Mat3.identity().translate(w / 2, h / 2);
    this.ctx.setTransform(...this.curTransform.toCanvas());

    this.updateIFactor();
  }

  public pushFilters(filters: string) {
    this.filterStack.push(this.ctx.filter);

    if(this.ctx.filter == 'none') this.ctx.filter = filters;
    else this.ctx.filter += ` ${filters}`;
  }

  public popFilters() {
    this.ctx.filter = this.filterStack.pop() || '';
  }

  public pushTransform(t: Transformation | Mat3) {
    this.transformStack.push(this.curTransform);
    if(t instanceof Mat3) {
      this.curTransform = this.curTransform.multiply(t);
    } else {
      this.curTransform = this.curTransform.translate(t.x ?? 0, t.y ?? 0);

      if(t.rotate) this.curTransform = this.curTransform.rotate(t.rotate);
      if(t.scale) this.curTransform = this.curTransform.scale(t.scale, t.scale);
      if(t.flip) this.curTransform = this.curTransform.scale(-1, 1);
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

  public drawImage(image: DrawableImages) {
    const [w, h] = getDrawableImageSize(image);

    this.ctx.drawImage(image, -w / 2, -h / 2);
  }

  public copyLast(): SavedFrame {
    this.copyHelperCtx?.drawImage(this.canvas, 0, 0);
    return new SavedFrame(this.copyHelper.transferToImageBitmap());
  }

  public saveFrame(name: string) {
    if(this.savedFrames[name]) this.savedFrames[name].dispose();
    this.savedFrames[name] = this.copyLast();
  }

  public cleanup() {
    Object.values(this.savedFrames).forEach((frame) => frame.dispose());
    this.savedFrames = {};
  }

  public putFrame(src: string | SavedFrame) {
    this.ctx.save();
    this.ctx.resetTransform();
    if(typeof src == 'string') {
      this.ctx.drawImage(this.savedFrames[src].getInternal(), 0, 0);
    } else {
      this.ctx.drawImage(src.getInternal(), 0, 0);
    }
    this.ctx.restore();
  }

  public with2D(cb: (ctx: CanvasRenderingContext2D) => void) {
    this.ctx.save();
    cb(this.ctx);
    this.ctx.restore();
  }

  public updateIFactor(): boolean {
    const prevIFactor = this.iFactor;
    this.iFactor =
      this.canvas.width / this.canvas.getBoundingClientRect().width;

    return prevIFactor != this.iFactor;
  }

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private copyHelper: OffscreenCanvas;
  private copyHelperCtx: OffscreenCanvasRenderingContext2D | null;

  private filterStack: string[];

  public iFactor: number = 1;

  private curTransform: Mat3 = Mat3.identity();
  private transformStack: Mat3[] = [];

  private savedFrames: { [key: string]: SavedFrame } = {};
}
