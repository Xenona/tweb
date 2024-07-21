import type { Canvaser } from "./Canvaser";
import { Mat3 } from "./Mat";
import { MouseEv, MouseMoveEv } from "./Mouse";
import { DrawableRect } from "./Rect";
import { RenderCtx } from "./Renderer";
import { BaseTool } from "./Tool";

export class Cropper  {
  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;

    this.rect = [-Infinity, -Infinity, Infinity, Infinity];
    this.angle = 0;

    this.prevRect = [-Infinity, -Infinity, Infinity, Infinity];
    this.prevAngle = 0;

    this.curInv = Mat3.identity();
    this.curTranform = Mat3.identity();
    this.updateTransform();
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
    this.updateTransform();
  }

  private updateTransform() {
    const rect = this.getRect();
    this.curTranform = Mat3.identity()
      .translate(-(rect[0] + rect[2]) / 2, -(rect[1] + rect[3]) / 2)
      .rotate(this.angle);
    this.curInv = this.curTranform.inverse();
    this.canvaser.emitUpdate();
  }

  public getTransform(): Mat3 {
    return this.curTranform;
  }

  apply(ctx: RenderCtx) {
    ctx.pushTransform(this.getTransform());
  }

  finish(ctx: RenderCtx) {
    ctx.popTransform();
  }

  public moveRect(dx: number, dy: number) {
    const rect = this.rect;

    this.rect = [rect[0] + dx, rect[1] + dy, rect[2] + dx, rect[3] + dy];
    this.updateTransform();
  }

  public updateRect(cord: number, val: number) {
    this.rect[cord] = val;
    this.updateTransform();
  }

  public reset() {
    this.rect = [-Infinity, -Infinity, Infinity, Infinity];
    this.updateTransform();
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
        this.updateTransform();
      },

      redo: () => {
        this.rect = [...newRect];
        this.prevRect = [...newRect];
        this.updateTransform();
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

  public toImgCords(x: number, y: number): [number, number] {
    return this.curInv.applyPoint(x, y);
  }

  public toImgVelocity(dx: number, dy: number): [number, number] {
    return [
      dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle),
      dx * Math.sin(-this.angle) + dy * Math.cos(-this.angle),
    ]
  }

  private angle: number;
  private rect: [number, number, number, number];

  private prevRect: [number, number, number, number];
  private prevAngle: number;

  private canvaser: Canvaser;

  private curTranform: Mat3;
  private curInv: Mat3;
}

class CropRect extends DrawableRect {
  protected renderBase(ctx: RenderCtx) {
    const w = this.o.w;
    const h = this.o.h;
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

type RatioResizeState = {
  aspect: number;
  closerLeft: boolean;
  closerTop: boolean;
};

export class CropTool extends BaseTool {
  constructor(canvaser: Canvaser) {
    super(canvaser);

    this.crop = this.canvaser.crop;
    this.rendRect = new CropRect();
  }

  public render(ctx: RenderCtx): void {
    ctx.setSize(...this.canvaser.crop.getRotatedImageWH());

    ctx.withTransform({ rotate: this.canvaser.crop.getAngle() }, () => {
      this.canvaser.rootImage.render(ctx);
    });

    this.rendRect.setPoints(...this.crop.getRect());
    this.rendRect.render(ctx);
  }

  public mouseUpDown(ev: MouseEv): void {
    if (!ev.pressed) {
      this.canvaser.crop.finishRectEdit();
    } else if (this.checkLim(ev.x, ev.y, 16 * ev.iFactor)) {
      const crop = this.canvaser.crop;
      const rect = crop.getRect();

      // Make crop rect size a WYSIWG
      for (let i = 0; i < 4; i++) crop.updateRect(i, rect[i]);
    }
  }

  checkLim(px: number, py: number, lim: number) {
    const rect = this.crop.getRect();

    if (px < Math.min(rect[0], rect[2]) - lim) return false;
    if (px > Math.max(rect[0], rect[2]) + lim) return false;
    if (py < Math.min(rect[1], rect[3]) - lim) return false;
    if (py > Math.max(rect[1], rect[3]) + lim) return false;

    return true;
  }

  mouseMove(ev: MouseMoveEv) {
    if (!ev.pressed) {
      this.ratioSource = undefined;
      return;
    }

    const ratioMode = this.forcedRatio || ev.shift;
    if (!ratioMode) this.ratioSource = undefined;

    if (this.ratioSource) return this.ratioResize(ev);

    const rect = this.crop.getRect();
    const px = ev.x - ev.dx;
    const py = ev.y - ev.dy;
    const lim = 16 * ev.iFactor;

    if (!this.checkLim(px, py, lim)) return;

    if (this.checkLim(px, py, -lim)) {
      return this.handleMove(ev);
    }

    if (ratioMode) return this.ratioResize(ev);

    const opSide = [2, 3, 0, 1];
    const pSide = [px, py, px, py];
    const eSide = [ev.x, ev.y, ev.x, ev.y];

    for (let i = 0; i < 4; i++) {
      const p = pSide[i];
      const di = Math.abs(p - rect[i]);

      if (di > lim) continue; // Move not touching border
      const opdi = Math.abs(p - rect[opSide[i]]);
      if (di > opdi) continue; // Move closer to opposite border
      if (di == opdi && i < opSide[i]) continue; // Handle right in the middle situation

      const e = eSide[i];
      if (ev.ctrl) {
        this.crop.updateRect(opSide[i], rect[i] + rect[opSide[i]] - e);
      }
      this.crop.updateRect(i, e);
    }
  }

  private handleMove(ev: MouseMoveEv) {
    this.crop.moveRect(ev.dx, ev.dy);
    if (this.forcedRatio) {
      this.updateAspected(this.forcedRatio);
    }
  }

  private ratioResize(ev: MouseMoveEv) {
    const px = ev.x - ev.dx;
    const py = ev.y - ev.dy;
    const lim = 16 * ev.iFactor;

    if (!this.ratioSource && this.checkLim(px, py, -lim))
      return this.handleMove(ev);

    const rect = this.crop.getRect();

    if (!this.ratioSource) {
      this.ratioSource = {
        aspect:
          this.forcedRatio ??
          Math.abs(rect[0] - rect[2]) / Math.abs(rect[3] - rect[1]),
        closerLeft: Math.abs(rect[0] - px) < Math.abs(rect[2] - px),
        closerTop: Math.abs(rect[1] - py) < Math.abs(rect[3] - py),
      };
    }

    const { aspect, closerLeft, closerTop } = this.ratioSource;

    const ah = aspect * (closerLeft !== closerTop ? -1 : 1);

    const dw = ev.dx;
    const dh = ev.dy * ah;

    const d = Math.abs(dw) > Math.abs(dh) ? dw : dh;
    const da = d / ah;

    this.crop.updateRect(closerLeft ? 0 : 2, rect[closerLeft ? 0 : 2] + d);
    this.crop.updateRect(closerTop ? 1 : 3, rect[closerTop ? 1 : 3] + da);

    if (ev.ctrl) {
      this.crop.updateRect(closerLeft ? 2 : 0, rect[closerLeft ? 2 : 0] - d);
      this.crop.updateRect(closerTop ? 3 : 1, rect[closerTop ? 3 : 1] - da);
    }

    this.updateAspected(aspect);
  }

  private updateAspected(ratio: number) {
    const rect = this.crop.getRect();

    const w = Math.abs(rect[2] - rect[0]);
    const h = Math.abs(rect[3] - rect[1]);
    const cx = (rect[0] + rect[2]) / 2;
    const cy = (rect[1] + rect[3]) / 2;

    const newSide = Math.min(w, h * ratio);

    if (Math.abs(w / h - ratio) < 0.0001) return;

    const nhs = newSide / 2;

    this.crop.updateRect(0, cx - nhs);
    this.crop.updateRect(1, cy - nhs / ratio);
    this.crop.updateRect(2, cx + nhs);
    this.crop.updateRect(3, cy + nhs / ratio);
  }

  public setForcedRatio(ratio: number | undefined) {
    this.forcedRatio = ratio;
    if (ratio) {
      this.updateAspected(ratio);
    }
  }

  private crop: Cropper;
  private rendRect: DrawableRect;
  private ratioSource: RatioResizeState | undefined;
  private forcedRatio: number | undefined;
}
