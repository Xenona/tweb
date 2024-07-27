import {Mat3} from './Mat';
import {MouseEv, MouseMoveEv} from './Mouse';
import {DrawableRect, Rect} from './Rect';
import {type RenderCtx} from './Renderer';

export interface IMouseResizable {
  getRect(): Rect;
  updateRect(r: Partial<Rect>): void;
}

type RatioResizeState = {
  angle: number;
  len: number;
  startW: number;
  startH: number;
};

type ResizerEvent = {
  rect: Rect;
  px: number;
  py: number;
  inside: boolean;
  atVertex: boolean;
  wBorder: boolean;
  hBorder: boolean;
  dw: number;
  dh: number;
  idx: number;
  idy: number;
  ctrl: boolean;
  shift: boolean;
};

export class  Resizer {
  constructor(target: IMouseResizable) {
    this.target = target;
    this.rendRect = new DrawableRect();
    this.resizeState = null;
    this.ratio = 1;
  }

  public setRendRect(rect: DrawableRect) {
    this.rendRect = rect;
  }

  public render(ctx: RenderCtx) {
    const rect = this.target.getRect();
    this.rendRect.setRect({...rect});
    this.rendRect.render(ctx);
  }

  private parseEvent(ev: MouseMoveEv | MouseEv): ResizerEvent {
    const rect = this.target.getRect();

    const idx = 'dx' in ev ? ev.dx : 0;
    const idy = 'dy' in ev ? ev.dy : 0;

    const [px, py] = Mat3.identity()
    .translate(rect.cx, rect.cy)
    .rotate(rect.angle)
    .inverse()
    .applyPoint(ev.imX - idx, ev.imY - idy);

    const inside = Math.abs(py) <= rect.h / 2 && Math.abs(px) <= rect.w / 2;

    const wBorder = Math.abs(rect.w / 2 - Math.abs(px)) <= 16 * ev.iFactor;
    const hBorder = Math.abs(rect.h / 2 - Math.abs(py)) <= 16 * ev.iFactor;

    const atVertex = wBorder && hBorder;

    const dw = idx * Math.cos(-rect.angle) - idy * Math.sin(-rect.angle);
    const dh = idx * Math.sin(-rect.angle) + idy * Math.cos(-rect.angle);

    return {
      rect,
      px,
      py,
      inside,
      atVertex,
      wBorder,
      hBorder,
      dw,
      dh,
      idx,
      idy,
      ctrl: ev.ctrl,
      shift: ev.shift
    };
  }

  mouseMove(ev: MouseMoveEv): boolean {
    if(!ev.pressed) {
      this.resizeState = null;
      return false;
    }

    const rev = this.parseEvent(ev);

    if(rev.atVertex || this.resizeState) return this.handleResize(rev);
    if(rev.inside) return this.handleMove(rev);

    return false;
  }

  private handleMove(ev: ResizerEvent) {
    this.target.updateRect({
      cx: ev.rect.cx + ev.idx,
      cy: ev.rect.cy + ev.idy
    });
    this.updateAspected();

    return true;
  }

  private handleResize(ev: ResizerEvent) {
    const {rect, px, py} = ev;
    const angle = Math.atan2(py, px);
    const len = Math.sqrt(px * px + py * py);
    if(!this.resizeState) {
      this.resizeState = {
        angle,
        len,
        startW: rect.w,
        startH: rect.h
      };
    }

    this.target.updateRect({
      angle: rect.angle - this.resizeState.angle + angle,
      w: (this.resizeState.startW / this.resizeState.len) * len,
      h: (this.resizeState.startH / this.resizeState.len) * len
    });
    this.updateAspected();

    return true;
  }

  private updateAspected() {
    const {w, h} = this.target.getRect();

    const newSide = Math.min(w, h * this.ratio);

    if(Math.abs(w / h - this.ratio) < 0.0001) return;

    this.target.updateRect({
      w: newSide,
      h: newSide / this.ratio
    });
  }

  public setForcedRatio(ratio: number) {
    this.ratio = ratio;
    this.updateAspected();
  }

  public isInside(ev: MouseEv, includeResize: boolean = false) {
    const rev = this.parseEvent(ev);
    return rev.inside || (includeResize && rev.atVertex);
  }

  private target: IMouseResizable;
  private rendRect: DrawableRect;
  private resizeState: RatioResizeState | null;
  private ratio: number;
}

export class ResizerRect extends DrawableRect {
  protected renderAngle(ctx: RenderCtx): void {
    ctx.with2D((c) => {
      c.fillStyle = 'white';
      c.beginPath();
      c.arc(0, 0, 6 * ctx.iFactor, 0, 2 * Math.PI);
      c.fill();
    });
  }

  protected renderBase(ctx: RenderCtx): void {
    ctx.with2D((c) => {
      c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      c.lineWidth = 4 * ctx.iFactor;
      c.setLineDash([8 * ctx.iFactor, 8 * ctx.iFactor]);
      c.strokeRect(-this.o.w / 2, -this.o.h / 2, this.o.w, this.o.h);
    });
  }
}
