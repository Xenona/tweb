import type {Canvaser} from './Canvaser'
import {RenderCtx} from './Renderer'

export class RootImage {
  constructor(canvaser: Canvaser, image: HTMLImageElement) {
    this.canvaser = canvaser
    this.image = image
  }

  public get width(): number {
    return this.image.naturalWidth
  }

  public get height(): number {
    return this.image.naturalHeight
  }

  public render(ctx: RenderCtx) {
    ctx.drawImage(this.image)
  }

  private canvaser: Canvaser
  private image: HTMLImageElement
}
