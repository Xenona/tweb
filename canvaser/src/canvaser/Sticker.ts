import type { Canvaser } from "./Canvaser";
import { HistoryValueHelper } from "./History";
import { Layer, LayerPriority } from "./Layer";
import { MouseEv, MouseMoveEv } from "./Mouse";
import { Rect } from "./Rect";
import { DrawableImages, RenderCtx, getDrawableImageSize } from "./Renderer";
import { IMouseResizable, Resizer, ResizerRect } from "./Resizer";

export class StickerLayer extends Layer implements IMouseResizable {
  constructor(canvaser: Canvaser, src: DrawableImages) {
    super(canvaser);
    this.src = src;

    const [cw, ch] = canvaser.crop.getSize();
    const s = 128 * this.canvaser.iFactor;
    const rw = cw - 1.5 * s;
    const rh = ch - 1.5 * s;

    const [cx, cy] = canvaser.crop.toImgCords(
      Math.random() * rw - rw / 2,
      Math.random() * rh - rh / 2
    );

    this.r = {
      cx,
      cy,
      w: s,
      h: s,
      angle: -canvaser.crop.getAngle() + 0,
    };

    this.resizer = new Resizer(this);
    this.resizer.setForcedRatio(1);
    this.resizer.setRendRect(new ResizerRect());

    this.hist = new HistoryValueHelper(
      canvaser,
      () => this.r,
      (v) => this.updateRect(v)
    );
  }

  public render(ctx: RenderCtx) {
    const [iniW, _] = getDrawableImageSize(this.src);
    const scale = this.r.w / iniW;

    ctx.withTransform(
      { x: this.r.cx, y: this.r.cy, rotate: this.r.angle, scale },
      () => {
        ctx.drawImage(this.src);
      }
    );

    if (this.canvaser.focusedLayer == this) this.resizer.render(ctx);
  }

  public getRect() {
    return this.r;
  }

  public updateRect(r: Partial<Rect>): void {
    this.r = { ...this.r, ...r };
    this.canvaser.emitUpdate();
  }

  public mouseMove(ev: MouseMoveEv) {
    const [dx, dy] = this.canvaser.crop.toImgVelocity(ev.dx, ev.dy);

    this.resizer.mouseMove({ ...ev, dx, dy });
  }

  public get priority(): LayerPriority {
    return LayerPriority.Stickers;
  }

  public mouseUpDown(ev: MouseEv): void {
    
    if (!this.resizer.isInside(ev, true)) {
      this.canvaser.focusedLayer = null;
      this.canvaser.tryFocusLayer(ev);
      return;
    } else {
      if (!ev.pressed) this.hist.emitHistory();
    }
  }

  public shouldFocus(ev: MouseEv): boolean {
    return this.resizer.isInside(ev, this.canvaser.focusedLayer == this);
  }

  protected src: DrawableImages;
  protected r: Rect;
  protected resizer: Resizer;
  protected hist: HistoryValueHelper<Rect>;
}
