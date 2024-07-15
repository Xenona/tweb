import { MouseMoveEv } from "./Mouse";
import { Rect, type RenderCtx } from "./Renderer";

export interface IMouseResizable {
  getRect(): [number, number, number, number];
  updateRect(side: number, value: number): void;
  moveRect(dx: number, dy: number): void;
}

type RatioResizeState = {
  aspect: number;
  closerLeft: boolean;
  closerTop: boolean;
};

export class Resizer {
  constructor(target: IMouseResizable) {
    this.target = target;
    this.rendRect = new Rect();
  }

  setRendRect(rect: Rect) {
    this.rendRect = rect;
  }

  render(ctx: RenderCtx) {
    this.rendRect.setPoints(...this.target.getRect());
    this.rendRect.render(ctx);
  }

  checkLim(px: number, py: number, lim: number) {
    const rect = this.target.getRect();

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

    const rect = this.target.getRect();
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
        this.target.updateRect(opSide[i], rect[i] + rect[opSide[i]] - e);
      }
      this.target.updateRect(i, e);
    }
  }

  private handleMove(ev: MouseMoveEv) {
    this.target.moveRect(ev.dx, ev.dy);
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

    const rect = this.target.getRect();

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

    console.log(aspect, d, da, d / da, rect[closerLeft ? 0 : 2] / rect[closerTop ? 1 : 3])

    this.target.updateRect(closerLeft ? 0 : 2, rect[closerLeft ? 0 : 2] + d);
    this.target.updateRect(closerTop ? 1 : 3, rect[closerTop ? 1 : 3] + da);

    if (ev.ctrl) {
      this.target.updateRect(closerLeft ? 2 : 0, rect[closerLeft ? 2 : 0] - d);
      this.target.updateRect(closerTop ? 3 : 1, rect[closerTop ? 3 : 1] - da);
    }

    this.updateAspected(aspect);
  }

  private updateAspected(ratio: number) {
    const rect = this.target.getRect();

    const w = Math.abs(rect[2] - rect[0]);
    const h = Math.abs(rect[3] - rect[1]);
    const cx = (rect[0] + rect[2]) / 2;
    const cy = (rect[1] + rect[3]) / 2;

    const newSide = Math.min(w, h * ratio);

    if (Math.abs(w / h - ratio) < 0.0001) return;

    const nhs = newSide / 2;

    this.target.updateRect(0, cx - nhs);
    this.target.updateRect(1, cy - nhs / ratio);
    this.target.updateRect(2, cx + nhs);
    this.target.updateRect(3, cy + nhs / ratio);
  }

  public setForcedRatio(ratio: number | undefined) {
    this.forcedRatio = ratio;
    if (ratio) {
      this.updateAspected(ratio);
    }
  }

  private target: IMouseResizable;
  private rendRect: Rect;
  private ratioSource: RatioResizeState | undefined;
  private forcedRatio: number | undefined;
}
