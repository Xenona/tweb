import type {Canvaser} from './Canvaser';
import {HistoryValueHelper} from './History';
import {Layer, LayerPriority} from './Layer';
import {MouseEv, MouseMoveEv} from './Mouse';
import {Rect} from './Rect';
import {DrawableImages, RenderCtx, getDrawableImageSize} from './Renderer';
import {IMouseResizable, Resizer, ResizerRect} from './Resizer';

type TextResult = {
  totalW: number;
  totalH: number;
  lineH: number;
  linesW: number[];
  linesX: number[];
  lines: string[];
};

export type TextOptions = {
  text: string;
  color: string;
  size: number;
  font: string;
  align: 'left' | 'center' | 'right';
  mode: 'normal' | 'stroke' | 'shield';
};

const alignComputers = {
  left: (w: number, t: number) => -t / 2,
  center: (w: number, t: number) => -t / 2 + (t - w) / 2,
  right: (w: number, t: number) => -t / 2 + (t - w)
};

function drawShield(c: CanvasRenderingContext2D, t: TextResult) {
  const w = t.linesW.map((e) => e + 16);
  const x = t.linesX.map((e) => e - 8);
  const xw = x.map((e, i) => e + w[i]);
  const hh = t.totalH / 2;
  const lh = t.lineH;
  const radLimit = t.lineH / 4;

  c.beginPath();
  c.moveTo(x[0] + w[0] / 2, -hh);
  c.arcTo(x[0], -hh, x[0], -hh + lh, Math.min(radLimit, w[0] / 2));

  for(let i = 1; i < x.length; i++) {
    const diff = Math.abs(x[i] - x[i - 1]);
    const rad = Math.min(radLimit, diff / 2);
    c.arcTo(x[i - 1], -hh + lh * i, x[i], -hh + lh * i, rad);
    c.arcTo(x[i], -hh + lh * i, x[i], -hh + lh * (i + 1), rad);
  }

  const l = x.length - 1;
  c.arcTo(x[l], hh, xw[l], hh, Math.min(radLimit, w[l] / 2));
  c.arcTo(xw[l], hh, xw[l], hh - lh, Math.min(radLimit, w[l] / 2));

  for(let i = l; i >= 1; i--) {
    const diff = Math.abs(x[i - 1] + w[i - 1] - x[i] - w[i]);
    const rad = Math.min(radLimit, diff / 2);
    c.arcTo(xw[i], -hh + lh * i, xw[i - 1], -hh + lh * i, rad);
    c.arcTo(xw[i - 1], -hh + lh * i, xw[i - 1], -hh + lh * (i - 1), rad);
  }

  c.arcTo(xw[0], -hh, x[0] + w[0] / 2, -hh, Math.min(radLimit, w[0] / 2));
  c.lineTo(x[0] + w[0] / 2, -hh);
}

export class TextLayer extends Layer implements IMouseResizable {
  constructor(canvaser: Canvaser, text: string) {
    super(canvaser);
    this.opts = {
      text,
      color: '#FFFFFF',
      size: 120,
      font: 'Roboto',
      align: 'center',
      mode: 'normal'
    };
    this.textRes = {
      totalW: 0,
      totalH: 0,
      lineH: 0,
      linesW: [],
      linesX: [],
      lines: []
    };

    const [cw, ch] = canvaser.crop.getSize();
    const rw = cw - 256 * this.canvaser.iFactor;
    const rh = ch - 256 * this.canvaser.iFactor;

    this.pos = canvaser.crop.toImgCords(
      Math.random() * rw - rw / 2,
      Math.random() * rh - rh / 2
    );
    (this.angle = -canvaser.crop.getAngle() + 0),
    (this.resizer = new Resizer(this));
    this.resizer.setForcedRatio(1);
    this.resizer.setRendRect(new ResizerRect());

    this.hist = new HistoryValueHelper(
      canvaser,
      () => ({
        pos: this.pos,
        angle: this.angle,
        opts: this.opts
      }),
      (v) => {
        this.pos = v.pos;
        this.angle = v.angle;
        this.opts = v.opts;
        this.canvaser.emitUpdate();
      }
    );
  }

  public render(ctx: RenderCtx) {
    ctx.withTransform(
      {x: this.pos[0], y: this.pos[1], rotate: this.angle},
      () =>
        ctx.with2D((c) => {
          this.textRes = this.computeText(c);

          if(this.opts.mode === 'normal') {
            c.fillStyle = this.opts.color;
          } else if(this.opts.mode === 'stroke') {
            c.fillStyle = 'white';
            c.strokeStyle = this.opts.color;
            c.lineJoin = 'bevel';
            c.lineWidth = this.opts.size / 24;
          } else if(this.opts.mode === 'shield') {
            c.fillStyle = this.opts.color;
            drawShield(c, this.textRes);
            c.fill();
            c.fillStyle = 'white';
          }

          for(let i = 0; i < this.textRes.lines.length; i++) {
            const ops: [string, number, number] = [
              this.textRes.lines[i],
              this.textRes.linesX[i],
              -this.textRes.totalH / 2 + (i + 1) * this.textRes.lineH
            ];
            c.fillText(...ops);
            if(this.opts.mode === 'stroke') c.strokeText(...ops);
          }
        })
    );

    if(this.canvaser.focusedLayer == this) this.resizer.render(ctx);
  }

  public computeText(c: CanvasRenderingContext2D): TextResult {
    c.font = `bold ${this.opts.size}px "${this.opts.font}"  `;
    c.textBaseline = 'bottom';

    const lines = this.opts.text
    .split('\n')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
    if(lines.length == 0)
      return {
        totalH: 0,
        totalW: 0,
        lineH: 0,
        linesW: [],
        linesX: [],
        lines: []
      };
    const linesMetrics = lines.map((l) => c.measureText(l));
    const lineH =
      linesMetrics[0].fontBoundingBoxAscent -
      linesMetrics[0].fontBoundingBoxDescent;
    const totalH = lineH * lines.length;
    const linesW = linesMetrics.map(
      (m) => m.actualBoundingBoxRight - m.actualBoundingBoxLeft
    );
    const totalW = Math.max(...linesW);
    const linesX = linesW.map((w) =>
      alignComputers[this.opts.align](w, totalW)
    );

    return {
      totalH,
      totalW,
      lineH,
      linesW,
      linesX,
      lines
    };
  }

  public getRect() {
    return {
      cx: this.pos[0],
      cy: this.pos[1],
      angle: this.angle,
      w: this.textRes.totalW + 16,
      h: this.textRes.totalH + 16
    };
  }

  public updateRect(r: Partial<Rect>): void {
    this.pos = [r.cx ?? this.pos[0], r.cy ?? this.pos[1]];
    this.angle = r.angle ?? this.angle;
    this.canvaser.emitUpdate();
  }

  public mouseMove(ev: MouseMoveEv) {
    const [dx, dy] = this.canvaser.crop.toImgVelocity(ev.dx, ev.dy);

    this.resizer.mouseMove({...ev, dx, dy});
  }

  public get priority(): LayerPriority {
    return LayerPriority.Stickers;
  }

  public mouseUpDown(ev: MouseEv): void {
    if(!this.resizer.isInside(ev, true)) {
      this.canvaser.focusedLayer = null;
      this.canvaser.tryFocusLayer(ev);
      return;
    } else if(!ev.pressed) this.hist.emitHistory();
  }

  public shouldFocus(ev: MouseEv): boolean {
    return this.resizer.isInside(ev, this.canvaser.focusedLayer == this);
  }

  public updateText(opts: Partial<TextOptions>) {
    this.opts = {...this.opts, ...opts};
    this.canvaser.emitUpdate();
  }

  public emitHistory() {
    this.hist.emitHistory();
  }

  public getText(): TextOptions {
    return this.opts;
  }

  protected opts: TextOptions;
  protected pos: [number, number];
  protected angle: number;
  protected resizer: Resizer;
  protected textRes: TextResult;

  protected hist: HistoryValueHelper<{
    pos: [number, number];
    angle: number;
    opts: TextOptions;
  }>;
}
