import { Cropper } from "./Crop";
import { MouseEv } from "./Mouse";
import { RenderCtx } from "./Renderer";
import { RootEffects } from "./RootEffects";
import { RootImage } from "./RootImage";
import { BaseTool, NoneTool } from "./Tool";

type EditHistory = {
  undo: () => void;
  redo: () => void;
};

export class Canvaser {
  constructor(canvas: HTMLCanvasElement, rootImage: HTMLImageElement) {
    this.canvas = canvas;
    this.ctx = new RenderCtx(canvas);

    this.crop = new Cropper(this);
    this.rootImage = new RootImage(this, rootImage);
    this.rootEffects = new RootEffects(this);

    this.tool = new NoneTool(this);

    this.resizeObserver = new ResizeObserver(this.canvasActuallyResized)
    this.resizeObserver.observe(canvas)

    canvas.addEventListener("mousemove", this.mouseMove);
    canvas.addEventListener("mouseup", this.mouseUpDown);
    canvas.addEventListener("mousedown", this.mouseUpDown);
  }

  detach() {
    this.resizeObserver.unobserve(this.canvas);
    this.canvas.removeEventListener("mousemove", this.mouseMove);
    this.canvas.removeEventListener("mouseup", this.mouseUpDown);
    this.canvas.removeEventListener("mousedown", this.mouseUpDown);
  }

  public emitUpdate() {
    if (this.updateRequested) return;

    this.updateRequested = true;

    requestAnimationFrame(() => this.doUpdate());
  }

  private doUpdate() {
    this.updateRequested = false;
    this.tool.update();
    this.tool.render(this.ctx);
  }

  public render(ctx: RenderCtx) {
    ctx.setSize(...this.crop.getSize());
    this.crop.apply(ctx);

    this.rootEffects.apply(ctx);
    this.rootImage.render(ctx);
    this.rootEffects.finish(ctx);

    this.crop.finish(ctx);
  }

  public setTool(tool: BaseTool) {
    this.tool = tool;
    this.emitUpdate();
  }

  public emitHistory(h: EditHistory) {
    this.undoStack.push(h);
    this.redoStack = [];
  }

  public undo() {
    const h = this.undoStack.pop();
    if (!h) return;
    h.undo();
    this.redoStack.push(h);
  }

  public redo() {
    const h = this.redoStack.pop();
    if (!h) return;
    h.redo();
    this.undoStack.push(h);
  }

  private intoMouseEvent(ev: MouseEvent): MouseEv {
    const x = ev.offsetX * this.ctx.iFactor - this.canvas.width / 2;
    const y = ev.offsetY * this.ctx.iFactor - this.canvas.height / 2;

    return {
      x: x,
      y: y,
      pressed: ev.buttons == 1,
      shift: ev.shiftKey,
      ctrl: ev.ctrlKey,
      iFactor: this.ctx.iFactor,
    };
  }

  private mouseMove = (event: MouseEvent) => {
    const ev = this.intoMouseEvent(event);
    this.tool.mouseMove({
      ...ev,
      dx: ev.x - this.prevMousePos[0],
      dy: ev.y - this.prevMousePos[1],
    });
    this.prevMousePos = [ev.x, ev.y];
  };

  private mouseUpDown = (event: MouseEvent) => {
    const ev = this.intoMouseEvent(event);
    this.tool.mouseUpDown(ev);
  };

  private canvasActuallyResized = () => {
    if(this.ctx.updateIFactor()) 
      this.emitUpdate();
    console.log(this.ctx.iFactor)
  };

  private canvas: HTMLCanvasElement;
  private ctx: RenderCtx;
  private updateRequested = false;
  private tool: BaseTool;

  public crop: Cropper;
  public rootImage: RootImage;
  public rootEffects: RootEffects;

  private undoStack: EditHistory[] = [];
  private redoStack: EditHistory[] = [];

  private prevMousePos: [number, number] = [0, 0];
  private resizeObserver: ResizeObserver;
}
