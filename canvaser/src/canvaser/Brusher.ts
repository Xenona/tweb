import type { Canvaser } from "./Canvaser";
import { Layer, LayerPriority } from "./Layer";
import { MouseEv, MouseMoveEv } from "./Mouse";
import { RenderCtx } from "./Renderer";
import { BaseTool } from "./Tool";

type BrushPoint =
  | {
      type: "point";
      x: number;
      y: number;
    }
  | {
      type: "begin" | "end";
    };

type BrushOptions = {
  color: string;
  size: number;
};

export class BrusherLayer extends Layer {
  constructor(canvaser: Canvaser, opts: BrushOptions) {
    super(canvaser);
    this.opts = opts;
    this.points = [];
  }

  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();
      c.strokeStyle = "red";
      c.lineCap = "round";
      c.lineJoin = "round";
      c.shadowColor = "orange";
      c.shadowBlur = 40 * ctx.iFactor;
      c.lineWidth = 10 * ctx.iFactor;

      this.movePoints(c);
      c.stroke();
    });
  }

  protected movePoints(c: CanvasRenderingContext2D) {
    let begin = false;
    for (const p of this.points) {
      if (p.type == "begin") {
        begin = true;
      } else if (p.type == "point") {
        if (begin) {
          c.moveTo(p.x, p.y);
          begin = false;
        }
        c.lineTo(p.x, p.y);
      }
    }
    c.stroke();
  }

  get combinable(): boolean {
    return false;
  }

  public addPoint(x: number, y: number) {
    this.points.push({ type: "point", x, y });
    this.canvaser.emitUpdate();
  }

  public beginSegment() {
    if (this.points.length != 0) {
      let stash: BrushPoint[] = [];
      
      this.canvaser.emitHistory({
        undo: () => {
          let cutFrom = this.points.length - 2;
          while (this.points[cutFrom].type != "end") cutFrom--;

          stash = this.points.splice(cutFrom + 1);
          this.canvaser.emitUpdate();
        },

        redo: () => {
          this.points.push(...stash);
          stash = [];
          this.canvaser.emitUpdate();
        },
      });
    }

    this.points.push({ type: "begin" });
    this.canvaser.emitUpdate();
  }

  public endSegment() {
    this.points.push({ type: "end" });

    this.canvaser.emitUpdate();
  }
  
  public get priority(): LayerPriority {
    return LayerPriority.Drawing  
  }

  public mouseMove(ev: MouseMoveEv) {
    if (ev.pressed) {
      this.addPoint(ev.imX, ev.imY);
    }
  }

  public mouseUpDown(ev: MouseEv) {
    if(ev.pressed) {
      this.beginSegment();
      this.addPoint(ev.imX, ev.imY);
    } else {
      this.endSegment();
      this.canvaser.focusedLayer = null;
      this.canvaser.emitUpdate();
    }
  }

  protected points: BrushPoint[];
  protected opts: BrushOptions;
}

export class PenBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();
      c.strokeStyle = this.opts.color;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.lineWidth = this.opts.size * ctx.iFactor;

      this.movePoints(c);
      c.stroke();
    });
  }
}

export class ArrowBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();
      c.strokeStyle = this.opts.color;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.lineWidth = this.opts.size * ctx.iFactor;

      this.movePoints(c);
      c.stroke();

      let lastPoints = [[0, 0]];
      for (const p of this.points) {
        if (p.type == "point") {
          lastPoints.push([p.x, p.y]);
          if (lastPoints.length > 10) lastPoints.shift();
        } else if (p.type == "end") {
          if (lastPoints.length < 10) continue;

          const dx = lastPoints[9][0] - lastPoints[0][0];
          const dy = lastPoints[9][1] - lastPoints[0][1];
          c.translate(lastPoints[9][0], lastPoints[9][1]);
          c.rotate(Math.atan2(dy, dx));
          c.moveTo(-40, -35);
          c.lineTo(0, 0);
          c.lineTo(-40, 35);
          c.stroke();
        }
      }
    });
  }
}

export class MarkerBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();
      c.strokeStyle = this.opts.color;
      c.lineCap = "butt";
      c.lineJoin = "round";
      c.globalAlpha = 0.25;
      c.lineWidth = 1.2 * this.opts.size * ctx.iFactor;

      this.movePoints(c);
      c.stroke();
    });
  }
}

export class NeonBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();

      c.strokeStyle = "white";
      c.lineCap = "round";
      c.lineJoin = "round";
      c.shadowColor = this.opts.color;
      c.shadowBlur = this.opts.size * ctx.iFactor;
      c.lineWidth = this.opts.size * ctx.iFactor;

      this.movePoints(c);
      c.stroke();
    });
  }
}

export class EraserBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    ctx.with2D((c) => {
      c.beginPath();

      c.strokeStyle = "white";
      c.lineCap = "round";
      c.lineJoin = "round";
      c.lineWidth = 2 * this.opts.size * ctx.iFactor;
      c.globalCompositeOperation = "destination-out";

      this.movePoints(c);
      c.stroke();

      c.globalCompositeOperation = "destination-over";
      ctx.putFrame("image");
    });
  }

  get combinable(): boolean {
    return true;
  }
}

export class BlurBrush extends BrusherLayer {
  render(ctx: RenderCtx) {
    const f = ctx.copyLast();
    ctx.with2D((c) => {
      c.beginPath();

      c.strokeStyle = "white";
      c.lineCap = "round";
      c.lineJoin = "round";
      c.lineWidth = 2 * this.opts.size * ctx.iFactor;
      c.globalCompositeOperation = "destination-out";

      this.movePoints(c);
      c.stroke();

      c.filter = "blur(10px)";
      c.globalCompositeOperation = "destination-over";
      ctx.putFrame(f);
    });
    f.dispose();
  }

  get combinable(): boolean {
    return true;
  }
}

export class BrusherTool extends BaseTool {
  constructor(canvaser: Canvaser) {
    super(canvaser);
    this.lastLayer = null;
    this.curBrush = BrusherLayer;

    this.size = 10;
    this.color = "red";
  }

  mouseUpDown(ev: MouseEv): void {
    if(ev.pressed) {
      this.canvaser.tryFocusLayer(ev);
    
      if(!this.canvaser.focusedLayer) {
        if (
          !this.lastLayer ||
          !this.lastLayer.combinable ||
          !(this.lastLayer instanceof this.curBrush)
        ) {
          this.lastLayer = new this.curBrush(this.canvaser, {
            size: this.size,
            color: this.color,
          });
          this.canvaser.addLayer(this.lastLayer);
        }
        this.canvaser.focusedLayer = this.lastLayer;
        this.canvaser.emitUpdate();
      }
    }

    if(this.canvaser.focusedLayer) {
      this.canvaser.focusedLayer.mouseUpDown(ev);
    }
  }

  public setSize(s: number) {
    this.size = s;
  }

  public setColor(c: string) {
    this.color = c;
  }

  setBrush(b: typeof BrusherLayer) {
    this.curBrush = b;
  }

  private lastLayer: BrusherLayer | null;
  private curBrush: typeof BrusherLayer;
  private size: number;
  private color: string;
}
