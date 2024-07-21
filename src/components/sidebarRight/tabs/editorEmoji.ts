import { AppManagers } from "../../../lib/appManagers/managers";
import rootScope from "../../../lib/rootScope";
import StickersTab from "../../emoticonsDropdown/tabs/stickers";
import LazyLoadQueue from "../../lazyLoadQueue";
import { ICanvaser } from "../../popups/mediaEditor";

export class EditorElmojiTab {
  
  canvaser: ICanvaser;
  container: HTMLElement;
  stickersTab: StickersTab;
  managers: AppManagers;
  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;
    this.managers = rootScope.managers;
    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'emoji')
    
    const lazyLoadQueue = new LazyLoadQueue();

    const stickersTab = new StickersTab(this.managers)
    stickersTab.attachedLazyLoadQueue = lazyLoadQueue
    stickersTab.getContainerSize = () => {
      const containerRect  = this.container.getBoundingClientRect()
      return {
        width: containerRect.width,
        height: containerRect.height
      }
    }
    stickersTab.container.classList.add('active')
    this.container.append(stickersTab.container)
    stickersTab.init();
  }
}
