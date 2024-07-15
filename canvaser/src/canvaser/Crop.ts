import type { Canvaser } from "./Canvaser";
import { MouseEv, MouseMoveEv } from "./Mouse";
import { Rect, RenderCtx } from "./Renderer";
import { IMouseResizable, Resizer } from "./Resizer";
import { BaseTool } from "./Tool";

export class Cropper implements IMouseResizable {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;

    this.rect = [-Infinity, -Infinity, Infinity, Infinity];
    this.prevRect = [-Infinity, -Infinity, Infinity, Infinity];
    this.prevAngle = 0;

    this.angle = 0;
  }

  public getRotatedImageWH(): [number, number] {
    const ihw = this.canvaser.rootImage.width / 2;
    const ihh = this.canvaser.rootImage.height / 2;

    const points = [
      [-ihw, -ihh],
      [ihw, -ihh],
      [ihw, ihh],
      [-ihw, ihh],
    ].map((p) => [
      p[0] * Math.cos(this.angle) - p[1] * Math.sin(this.angle),
      p[0] * Math.sin(this.angle) + p[1] * Math.cos(this.angle),
    ]);

    const pointXs = points.map((p) => p[0]);
    const pointYs = points.map((p) => p[1]);

    return [
      Math.max(...pointXs) - Math.min(...pointXs),
      Math.max(...pointYs) - Math.min(...pointYs),
    ];
  }

  public getRect(): [number, number, number, number] {
    let [x1, y1, x2, y2] = this.rect;

    const [iw, ih] = this.getRotatedImageWH();
    const ihw = iw / 2;
    const ihh = ih / 2;

    return [
      Math.max(Math.min(x1, ihw), -ihw),
      Math.max(Math.min(y1, ihh), -ihh),
      Math.max(Math.min(x2, ihw), -ihw),
      Math.max(Math.min(y2, ihh), -ihh),
    ];
  }

  public getSize(): [number, number] {
    const rect = this.getRect();

    return [Math.abs(rect[2] - rect[0]), Math.abs(rect[3] - rect[1])];
  }

  public getAngle(): number {
    return this.angle;
  }

  public setAngle(angle: number) {
    this.angle = angle;
    this.canvaser.emitUpdate();
  }

  apply(ctx: RenderCtx) {
    const rect = this.getRect();

    ctx.pushTransform({
      rotate: this.angle,
      x: -(rect[0] + rect[2]) / 2,
      y: -(rect[1] + rect[3]) / 2,
    });
  }

  finish(ctx: RenderCtx) {
    ctx.popTransform();
  }

  public moveRect(dx: number, dy: number) {
    const rect = this.rect;

    this.rect = [rect[0] + dx, rect[1] + dy, rect[2] + dx, rect[3] + dy];
    this.canvaser.emitUpdate();
  }

  public updateRect(cord: number, val: number) {
    this.rect[cord] = val;
    this.canvaser.emitUpdate();
  }

  public reset() {
    this.rect = [-Infinity, -Infinity, Infinity, Infinity];
    this.canvaser.emitUpdate();
    this.finishRectEdit();
  }

  public finishRectEdit() {
    const prevRect: [number, number, number, number] = [...this.prevRect];
    const newRect: [number, number, number, number] = [...this.rect];

    if (
      Math.abs(prevRect[0] - newRect[0]) < 1 &&
      Math.abs(prevRect[1] - newRect[1]) < 1 &&
      Math.abs(prevRect[2] - newRect[2]) < 1 &&
      Math.abs(prevRect[3] - newRect[3]) < 1
    )
      return;

    this.canvaser.emitHistory({
      undo: () => {
        this.rect = [...prevRect];
        this.prevRect = [...prevRect];
        this.canvaser.emitUpdate();
      },

      redo: () => {
        this.rect = [...newRect];
        this.prevRect = [...newRect];
        this.canvaser.emitUpdate();
      },
    });

    this.prevRect = [...newRect];
  }

  public finishAngleEdit() {
    const prevAngle = this.prevAngle;
    const newAngle = this.angle;

    this.canvaser.emitHistory({
      undo: () => this.setAngle(prevAngle),
      redo: () => this.setAngle(newAngle),
    });

    this.prevAngle = newAngle;
  }

  private angle: number;
  private rect: [number, number, number, number];

  private prevRect: [number, number, number, number];
  private prevAngle: number;

  private canvaser: Canvaser;
}

class CropRect extends Rect {
  protected renderBase(ctx: RenderCtx) {
    const w = this.w;
    const h = this.h;
    const hw = w / 2;
    const hh = h / 2;

    ctx.with2D((c) => {
      c.strokeStyle = "rgba(255, 255, 255, 0.7)";
      c.lineWidth = 3 * ctx.iFactor;
      c.strokeRect(-hw, -hh, w, h);

      const lw = w / 6;
      const lh = h / 6;

      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-hw, -lh);
      c.lineTo(hw, -lh);

      c.moveTo(-hw, lh);
      c.lineTo(hw, lh);

      c.moveTo(-lw, -hh);
      c.lineTo(-lw, hh);

      c.moveTo(lw, -hh);
      c.lineTo(lw, hh);

      c.stroke();
    });
  }

  protected renderAngle(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.strokeStyle = "white";
      c.lineWidth = 6 * ctx.iFactor;

      c.beginPath();
      c.moveTo(16 * ctx.iFactor, 0);
      c.lineTo(0, 0);
      c.lineTo(0, 16 * ctx.iFactor);
      c.stroke();
    });
  }
}

export class CropTool extends BaseTool {
  constructor(canvaser: Canvaser) {
    super(canvaser);

    this.resizer = new Resizer(canvaser.crop);
  }

  public render(ctx: RenderCtx): void {
    ctx.setSize(...this.canvaser.crop.getRotatedImageWH());

    ctx.withTransform({ rotate: this.canvaser.crop.getAngle() }, () => {
      this.canvaser.rootImage.render(ctx);
    });

    const r = new CropRect();
    r.setPoints(...this.canvaser.crop.getRect());
    ctx.draw(r);
  }

  public mouseMove(ev: MouseMoveEv): void {
    this.resizer.mouseMove(ev);
  }

  public mouseUpDown(ev: MouseEv): void {
    if (!ev.pressed) {
      this.canvaser.crop.finishRectEdit();
    } else if (this.resizer.checkLim(ev.x, ev.y, 16 * ev.iFactor)) {
      const crop = this.canvaser.crop;
      const rect = crop.getRect();
      
      // Make crop rect size a WYSIWG
      for(let i = 0; i < 4; i++)
        crop.updateRect(i, rect[i]);
    }
  }

  public setForcedRatio(ratio: number | undefined) {
    this.resizer.setForcedRatio(ratio);
  }

  private resizer: Resizer;
}
