import deferredPromise, { CancellablePromise } from '../../helpers/cancellablePromise';
import {Cropper} from './Crop';
import {Layer, LayerPriority} from './Layer';
import {MouseEv} from './Mouse';
import {RenderCtx} from './Renderer';
import {RootEffects} from './RootEffects';
import {RootImage} from './RootImage';
import {BaseTool, NoneTool} from './Tool';

type EditHistory = {
  undo: () => void;
  redo: () => void;
};

export class Canvaser {
  constructor(canvas: HTMLCanvasElement, rootImage: HTMLImageElement) {
    this.canvas = canvas;
    this.ctx = new RenderCtx(canvas);

    this.rootImage = new RootImage(this, rootImage);

    this.crop = new Cropper(this);
    this.rootEffects = new RootEffects(this);
    this.layers = [];
    this.focusedLayer = null;

    this.tool = new NoneTool(this);

    this.resizeObserver = new ResizeObserver(this.canvasActuallyResized);
    this.resizeObserver.observe(canvas);

    canvas.addEventListener('mousemove', this.mouseMove);
    canvas.addEventListener('mouseup', this.mouseUpDown);
    canvas.addEventListener('mousedown', this.mouseUpDown);

    canvas.addEventListener('touchmove', this.handleTouchMove );
    canvas.addEventListener('touchend', this.handleTouchEnd );
    canvas.addEventListener('touchstart', this.handleTouchStart);
  }

 
  detach() {
    this.resizeObserver.unobserve(this.canvas);
    this.canvas.removeEventListener('mousemove', this.mouseMove);
    this.canvas.removeEventListener('mouseup', this.mouseUpDown);
    this.canvas.removeEventListener('mousedown', this.mouseUpDown);

    this.canvas.removeEventListener('touchmove', this.handleTouchMove );
    this.canvas.removeEventListener('touchend', this.handleTouchEnd );
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
  }

  private handleTouchStart = (e: TouchEvent) => {
    // debugger 
    const transformedEvent = this.touchIntoMouseEvent(e);
    this.mouseUpDown(transformedEvent)
  }

  private handleTouchEnd = (e: TouchEvent) => {
    const transformedEvent = this.touchIntoMouseEvent(e);
    this.mouseUpDown(transformedEvent)
  }

  private handleTouchMove = (e: TouchEvent) => {
    const transformedEvent = this.touchIntoMouseEvent(e);
    this.mouseMove(transformedEvent);
  }

  public getLayersOrdered() {
    const priorities: Layer[][] = []
    for(const l of this.layers) {
      const p = l.priority;
      while(priorities.length <= p) priorities.push([]);
      priorities[p].push(l)
    }

    return priorities.flat()
  }

  public emitUpdate() {
    if(this.updatePromise) return this.updatePromise;
    this.updatePromise = deferredPromise()

    requestAnimationFrame(() => this.doUpdate());
    return this.updatePromise;
  }

  private doUpdate() {
    const updProm = this.updatePromise
    this.updatePromise = null;
    
    this.tool.update();
    this.tool.render(this.ctx);
    this.ctx.cleanup();

    updProm.resolve();
  }

  public render(ctx: RenderCtx) {
    ctx.setSize(...this.crop.getSize());
    this.crop.apply(ctx);

    this.rootEffects.apply(ctx);
    this.ctx.withTransform({ flip: this.crop.isFlip() }, () =>{
      this.rootImage.render(ctx);
    })
    this.rootEffects.finish(ctx);
    ctx.saveFrame('image');

    this.getLayersOrdered().forEach((l) => l.render(ctx));

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
    if(!h) return;
    h.undo();
    this.redoStack.push(h);
    this.onUpdate?.(this);
  }

  public redo() {
    const h = this.redoStack.pop();
    if(!h) return;
    h.redo();
    this.undoStack.push(h);
    this.onUpdate?.(this);
  }

  public addLayer(l: Layer) {
    this.layers.push(l);
    this.emitHistory({
      undo: () => {
        this.layers.splice(this.layers.indexOf(l), 1);
        this.emitUpdate();
      },
      redo: () => {
        this.layers.push(l);
        this.emitUpdate();
      }
    });
    this.focusedLayer = l;
    this.emitUpdate();
  }

  public deleteLayer(l: Layer) {
    let lastPos = this.layers.length;
    const hist = {
      undo: () => {
        this.layers.splice(lastPos, 0, l);
        this.emitUpdate();
      },
      redo: () => {
        if(this.focusedLayer == l) this.focusedLayer = undefined;
        lastPos = this.layers.indexOf(l)
        this.layers.splice(lastPos, 1);
        this.emitUpdate();
      }
    }
    hist.redo();
    this.emitHistory(hist);
    this.emitUpdate();
    this.onUpdate?.(this);
  }

  private intoMouseEvent(ev: MouseEvent): MouseEv {
    const x = ev.offsetX * this.ctx.iFactor - this.canvas.width / 2;
    const y = ev.offsetY * this.ctx.iFactor - this.canvas.height / 2;

    const [imX, imY] = this.crop.toImgCords(x, y);

    return {
      x,
      y,
      imX,
      imY,
      pressed: ev.buttons == 1,
      shift: ev.shiftKey,
      ctrl: ev.ctrlKey,
      iFactor: this.ctx.iFactor
    };
  }

  private touchIntoMouseEvent(ev: TouchEvent): MouseEv {
    
    console.log('touch', this.lastClick)
    if (ev.touches.length == 0) {
      let click = this.lastClick;
      click.pressed = false;
      this.lastClick = null;
      return click;
    };
    console.log("XE ", ev.touches[0].clientX, ev.touches[0].clientY)
    console.log("SCREEN ", this.canvas.offsetLeft, this.canvas.offsetTop)
    //  {
    //   x: 0,
    //   y: 0,
    //   imX: 0,
    //   imY: 0,
    //   pressed: false,
    //   shift: ev.shiftKey,
    //   ctrl: ev.ctrlKey,
    //   iFactor: this.ctx.iFactor
    // };
    // const b = getBoundingClientRect();

    const x = (ev.touches[0].clientX - this.canvas.offsetLeft) * this.ctx.iFactor - this.canvas.width / 2;
    const y = (ev.touches[0].clientY - this.canvas.offsetTop) * this.ctx.iFactor - this.canvas.height / 2;
    console.log({x, y}, this.canvas.width, this.canvas.height)
    const [imX, imY] = this.crop.toImgCords(x, y);
    this.lastClick = {
      x,
      y,
      imX,
      imY,
      pressed: true,
      shift: ev.shiftKey,
      ctrl: ev.ctrlKey,
      iFactor: this.ctx.iFactor
    }
    return this.lastClick;
  }

  private mouseMove = (event: MouseEvent | MouseEv) => {
    let ev;
    if (event instanceof MouseEvent) {
      ev = this.intoMouseEvent(event);
    } else {
      ev = event
    }
    this.tool.mouseMove({
      ...ev,
      dx: ev.x - this.prevMousePos[0],
      dy: ev.y - this.prevMousePos[1]
    });
    this.prevMousePos = [ev.x, ev.y];
  };

  private mouseUpDown = (event: MouseEvent | MouseEv) => {
    let ev;
    if (event instanceof MouseEvent) {
      ev = this.intoMouseEvent(event);
    } else {
      ev = event
    }
    this.tool.mouseUpDown(ev);
  };

  public tryFocusLayer(ev: MouseEv) {
    this.focusedLayer =
      this.getLayersOrdered()
      .reverse()
      .find((l) => l.shouldFocus(ev)) ?? null;
    this.emitUpdate();
  }

  private canvasActuallyResized = () => {
    if(this.ctx.updateIFactor()) this.emitUpdate();
  };

  get iFactor() {
    return this.ctx.iFactor;
  }

  get isHistoryEmpty() {
    return this.undoStack.length === 0
  }

  private canvas: HTMLCanvasElement;
  private ctx: RenderCtx;
  private updatePromise: CancellablePromise<void> | null;
  private tool: BaseTool;

  public crop: Cropper;
  public rootImage: RootImage;
  public rootEffects: RootEffects;

  public layers: Layer[];
  public focusedLayer: Layer | null;

  private undoStack: EditHistory[] = [];
  private redoStack: EditHistory[] = [];

  private prevMousePos: [number, number] = [0, 0];
  private resizeObserver: ResizeObserver;
  private lastClick: MouseEv = null;

  public onUpdate: (canvaser: Canvaser) => void;
}
