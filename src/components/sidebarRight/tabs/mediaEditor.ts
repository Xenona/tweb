import IS_TOUCH_SUPPORTED from '../../../environment/touchSupport';
import findUpClassName from '../../../helpers/dom/findUpClassName';
import handleTabSwipe from '../../../helpers/dom/handleTabSwipe';
import lockTouchScroll from '../../../helpers/dom/lockTouchScroll';
import ListenerSetter from '../../../helpers/listenerSetter';
import {i18n, LangPackKey} from '../../../lib/langPack';
import Button from '../../button';
import {Canvaser} from '../../canvaser/Canvaser';
import {horizontalMenu} from '../../horizontalMenu';
import Icon from '../../icon';
import ripple from '../../ripple';
import {ScrollableX} from '../../scrollable';
import SliderSuperTab from '../../sliderTab';
import SwipeHandler from '../../swipeHandler';
import {EditorBrushTab} from './editorBrush';
import {EditorCropTab} from './editorCrop';
import {EditorElmojiTab} from './editorEmoji';
import {EditorFilterTab} from './editorFilter';
import {EditorTextTab} from './editorText';

export interface IAppMediaEditorTabParams {
  onClose: () => void,
  canvaser: Canvaser,
  cropRulerContainer: HTMLElement,
}

export type ScrollableMenuTabType = 'filter' | 'crop' | 'text' | 'brush' | 'emoji';
export type ScrollableMenuTab = {
  type: ScrollableMenuTabType,
  icon: Icon,
  contentTab?: HTMLElement,
  menuTab?: HTMLElement,
  menuTabName?: HTMLElement,
  scroll?: {scrollTop: number, scrollHeight: number},
}

export default class AppMediaEditorTab extends SliderSuperTab {
  redoBtn: HTMLButtonElement;
  undoBtn: HTMLButtonElement;
  deleteBtn: HTMLButtonElement;
  canvaser: Canvaser;
  tools: HTMLElement;
  navScrollable: ScrollableX;
  nav: HTMLElement;
  navScrollableContainer: HTMLElement;
  tabsContainer: HTMLElement;
  public selectTab: ReturnType<typeof horizontalMenu>;
  mediaTabsMap: Map<ScrollableMenuTabType, ScrollableMenuTab> = new Map();
  private swipeHandler: SwipeHandler;
  private prevTabId = -1;
  mediaTabs: ScrollableMenuTab[];
  mediaTab: ScrollableMenuTab;
  listenerSetter = new ListenerSetter();
  public tabs: {[t in ScrollableMenuTabType]: HTMLDivElement} = {} as any;
  menuList: HTMLElement;

  filterTab: EditorFilterTab;
  cropTab: EditorCropTab;
  textTab: EditorTextTab;
  brushTab: EditorBrushTab;
  emojiTab: EditorElmojiTab;

  imageContainer: HTMLElement;
  cropRulerContainer: HTMLElement;

  public async init({onClose, canvaser, cropRulerContainer}: IAppMediaEditorTabParams) {
    this.init = null;
    this.canvaser = canvaser;
    this.cropRulerContainer = cropRulerContainer;

    this.container.classList.add('media-editor-tab');

    // * header

    // ** close button
    const newCloseBtn = Button('btn-icon sidebar-close-button', {noRipple: true});
    this.closeBtn.replaceWith(newCloseBtn);
    this.closeBtn = newCloseBtn;
    this.closeBtn.onclick = onClose;
    const animatedCloseIcon = document.createElement('div');
    animatedCloseIcon.classList.add('animated-close-icon');
    newCloseBtn.append(animatedCloseIcon);

    // ** delete (sticker, text)
    this.deleteBtn = Button('btn-icon', {
      icon: 'delete',
    })
    // XENA TODO button
    this.deleteBtn.onclick = () => {
      if(this.canvaser.focusedLayer) {
        this.canvaser.deleteLayer(this.canvaser.focusedLayer);
        this.deleteBtn.style.display = 'none'
        this.canvaser.onUpdate?.(this.canvaser);
      }
    }

    this.deleteBtn.style.display = 'none';
    this.header.append(this.deleteBtn);
    
    // ** undo
    this.undoBtn = Button('btn-icon', {
      icon: 'undo'
    })
    this.undoBtn.onclick = () => this.canvaser.undo();
    this.header.append(this.undoBtn)

    // ** redo
    this.redoBtn = Button('btn-icon', {
      icon: 'redo'
    })
    this.redoBtn.onclick = () => this.canvaser.redo();
    this.header.append(this.redoBtn)


    // ** title
    this.setTitle('Edit');

    const verifyDeleteBtn = (show: boolean) => {
      console.log("XE show", show)
      if (show) {
        this.deleteBtn.style.display = 'flex';
      } else {
        this.deleteBtn.style.display = 'none';
      }
    }

    this.filterTab = new EditorFilterTab(this.canvaser);
    this.cropTab = new EditorCropTab(this.canvaser);
    this.textTab = new EditorTextTab(this.canvaser, verifyDeleteBtn);
    this.brushTab = new EditorBrushTab(this.canvaser);
    this.emojiTab = new EditorElmojiTab(this.canvaser, verifyDeleteBtn);

    this.createToolMenu();

    this.tabs['filter'].append(this.filterTab.container);
    this.tabs['crop'].append(this.cropTab.container);
    this.tabs['text'].append(this.textTab.container);
    this.tabs['brush'].append(this.brushTab.container);
    this.tabs['emoji'].append(this.emojiTab.container);
  }

  private createToolMenu() {
    this.mediaTabs = [{
      type: 'filter',
      icon: 'enhancebars'
    }, {
      type: 'crop',
      icon: 'crop'
    }, {
      type: 'text',
      icon: 'text'
    }, {
      type: 'brush',
      icon: 'brush'
    }, {
      type: 'emoji',
      icon: 'smile'
    }]

    const container = this.tools = document.createElement('div');
    container.classList.add('search-super');

    const header = document.createElement('div');
    header.classList.add('search-super-tabs-scrollable', 'menu-horizontal-scrollable', 'sticky');

    const scrollableX = new ScrollableX(header);
    scrollableX.container.classList.add('search-super-nav-scrollable');

    this.menuList = document.createElement('nav');
    this.menuList.classList.add('search-super-tabs', 'menu-horizontal-div');
    scrollableX.append(this.menuList);

    // creating headers for tabs
    for(const mediaTab of this.mediaTabs) {
      const menuTab = document.createElement('div');
      menuTab.classList.add('menu-horizontal-div-item');
      const span = document.createElement('span');
      span.classList.add('menu-horizontal-div-item-span');
      const i = document.createElement('i');
      span.append(Icon(mediaTab.icon));
      span.append(i);
      menuTab.append(span);
      ripple(menuTab);
      this.menuList.append(menuTab);
      this.mediaTabsMap.set(mediaTab.type, mediaTab);
      mediaTab.menuTab = menuTab;
    }

    this.tabsContainer = document.createElement('div');
    this.tabsContainer.classList.add('search-super-tabs-container', 'tabs-container');

    let unlockScroll: ReturnType<typeof lockTouchScroll>;
    if(IS_TOUCH_SUPPORTED) {
      this.swipeHandler = handleTabSwipe({
        element: this.tabsContainer,
        onSwipe: (xDiff, yDiff, e) => {
          xDiff *= -1;
          yDiff *= -1;
          const prevId = this.selectTab.prevId();
          const children = Array.from(this.menuList.children) as HTMLElement[];
          let idx: number;
          if(xDiff > 0) {
            for(let i = prevId + 1; i < children.length; ++i) {
              if(!children[i].classList.contains('hide')) {
                idx = i;
                break;
              }
            }
          } else {
            for(let i = prevId - 1; i >= 0; --i) {
              if(!children[i].classList.contains('hide')) {
                idx = i;
                break;
              }
            }
          }

          if(idx !== undefined) {
            unlockScroll = lockTouchScroll(this.tabsContainer);
            this.selectTab(idx);
          }
        },
        verifyTouchTarget: (e) => {
          return !findUpClassName(e.target, 'scrollable-x');
        }
      });
    }

    // creating the content for tabs
    for(const mediaTab of this.mediaTabs) {
      const container = document.createElement('div');
      container.classList.add('search-super-tab-container', 'search-super-container-' + mediaTab.type, 'tabs-tab');
      const content = document.createElement('div');
      content.classList.add('search-super-content-container', 'search-super-content-' + mediaTab.type);
      container.append(content);
      this.tabsContainer.append(container);
      // here's also some appSearchSuper.ts:561
      this.tabs[mediaTab.type] = content;

      mediaTab.contentTab = content;
    }

    container.append(header, this.tabsContainer);
    this.content.append(this.tools)

    // ^ here the layout is done.

    this.selectTab = horizontalMenu(this.menuList, this.tabsContainer, (id, tabContent, animate) => {
      const newMediaTab = this.mediaTabs[id];
      const fromMediaTab = this.mediaTab;
      this.mediaTab = newMediaTab;

      if(this.prevTabId !== -1 && animate) {
        this.onTransitionStart();
      }

      const offsetTop = this.container.offsetTop;
      let scrollTop = this.scrollable.scrollPosition;
      if(scrollTop < offsetTop) {
        this.scrollToStart();
        scrollTop = offsetTop;
      }

      fromMediaTab.scroll = {scrollTop: scrollTop, scrollHeight: this.scrollable.scrollSize};

      if(newMediaTab.scroll === undefined) {
        const rect = this.container.getBoundingClientRect();
        const rect2 = this.container.parentElement.getBoundingClientRect();
        const diff = rect.y - rect2.y;

        if(scrollTop > diff) {
          newMediaTab.scroll = {scrollTop: diff, scrollHeight: 0};
        }
      }

      if(newMediaTab.scroll) {
        const diff = fromMediaTab.scroll.scrollTop - newMediaTab.scroll.scrollTop;
        if(diff) {
          newMediaTab.contentTab.style.transform = `translateY(${diff}px)`;
        }
      }

      this.prevTabId = id;


      if(this.cropTab) {
        if(id === 1) { // crop tab
          this.canvaser.setTool(this.cropTab.curCropTool);
          this.cropRulerContainer.appendChild(this.cropTab.cropRuler)
          this.canvaser.onUpdate = this.cropTab.onUpdate.bind(this.cropTab)
        } else {
          if(this.cropTab.cropRuler.isConnected) {
            this.cropRulerContainer.removeChild(this.cropTab.cropRuler);
          }
        }
      }

      if(this.brushTab) {
        if(id === 3) {
          this.canvaser.setTool(this.brushTab.curBrushTool);

          this.canvaser.onUpdate = undefined;
        }
      }

      if(this.textTab) {
        if(id === 2) {
          this.canvaser.setTool((this.textTab.curTextTool))
          this.canvaser.onUpdate = this.textTab.onUpdate.bind(this.textTab);
        } else {
          this.textTab.setDefault();
        }
      }

      if(this.filterTab) {
        if(id === 0) {
          this.canvaser.setTool(this.filterTab.curFilterTool)
          this.canvaser.onUpdate = this.filterTab.onUpdate.bind(this.filterTab);
        }
      }

      if(this.emojiTab) {
        if(id === 4) {
          this.canvaser.setTool(this.emojiTab.curEmojiTool)
          this.canvaser.onUpdate = undefined;
        }
      }
    }, () => {
      this.scrollable.onScroll();
      if(this.mediaTab.scroll !== undefined) {
        this.mediaTab.contentTab.style.transform = '';
        this.scrollable.scrollPosition = this.mediaTab.scroll.scrollTop;
      }

      if(unlockScroll) {
        unlockScroll();
        unlockScroll = undefined;
      }
      this.canvaser.focusedLayer = undefined;
      this.canvaser.emitUpdate();
      this.canvaser.onUpdate?.(this.canvaser);
      
      this.deleteBtn.style.display = 'none';

      this.onTransitionEnd();
    }, undefined, scrollableX, this.listenerSetter)

    this.mediaTab = this.mediaTabs[0];

    (this.menuList.children[0] as HTMLElement).click();
  }

  private onTransitionStart = () => {
    this.container.classList.add('sliding');
  };
  private onTransitionEnd = () => {
    this.container.classList.remove('sliding');
  };

  private scrollToStart() {
    this.scrollable.scrollIntoViewNew({
      element: this.container,
      position: 'start'
    });
  }
}

export function setToolActive(toolsContainer: HTMLElement, tool: HTMLElement, className: string) {
  const c = toolsContainer.querySelectorAll(`.${className}`);
  for(let i = 0; i < c.length; i++) {
    if(c[i] instanceof HTMLElement) {
      c[i].classList.remove(className);
    }
  }
  tool.classList.add(className);
}

export function createNamedSection(name: LangPackKey): HTMLElement {
  const section = document.createElement('section');
  section.classList.add('named-section');
  const title = document.createElement('header');
  title.classList.add('named-section-title');
  title.append(i18n(name));
  section.append(title);

  return section
}

