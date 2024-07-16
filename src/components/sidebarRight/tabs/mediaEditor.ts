import IS_TOUCH_SUPPORTED from "../../../environment/touchSupport";
import { attachClickEvent } from "../../../helpers/dom/clickEvent";
import findUpClassName from "../../../helpers/dom/findUpClassName";
import handleTabSwipe from "../../../helpers/dom/handleTabSwipe";
import lockTouchScroll from "../../../helpers/dom/lockTouchScroll";
import ListenerSetter from "../../../helpers/listenerSetter";
import liteMode from "../../../helpers/liteMode";
import { i18n, LangPackKey } from "../../../lib/langPack";
import AppSearchSuper from "../../appSearchSuper.";
import Button from "../../button";
import { horizontalMenu } from "../../horizontalMenu";
import Icon from "../../icon";
import { aspectRatios, ICanvaser } from "../../popups/mediaEditor";
import ripple from "../../ripple";
import Row from "../../row";
import { ScrollableX } from "../../scrollable";
import SettingSection from "../../settingSection";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";
import SliderSuperTab from "../../sliderTab";
import SwipeHandler from "../../swipeHandler";

export interface IAppMediaEditorTabParams {
  onClose: () => void,
  canvaser: ICanvaser,
}

export interface IFilterTab {
  enchance: RangeSettingSelector;
  brightness: RangeSettingSelector;
  contrast: RangeSettingSelector;
  saturation: RangeSettingSelector;
  warmth: RangeSettingSelector;
  fade: RangeSettingSelector;
  highlights: RangeSettingSelector;
  shadows: RangeSettingSelector;
  vignette: RangeSettingSelector;
  grain: RangeSettingSelector;
  sharpen: RangeSettingSelector;

  container: HTMLDivElement;
}

export interface ICropTab {

  container: HTMLDivElement;
}

export type ScrollableMenuTabType = 'filter' | 'crop' | 'text' | 'paint' | 'emoji';
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
  canvaser: ICanvaser;
  tools: HTMLElement;
  navScrollable: ScrollableX;
  nav: HTMLElement;
  navScrollableContainer: HTMLElement;
  tabsContainer: HTMLElement;
  public selectTab: ReturnType<typeof horizontalMenu>;
  mediaTabsMap: Map<ScrollableMenuTabType, ScrollableMenuTab> = new Map();
  private swipeHandler: SwipeHandler;
  private prevTabId = -1;
  private skipScroll: boolean;
  mediaTabs: ScrollableMenuTab[];
  mediaTab: ScrollableMenuTab;
  listenerSetter = new ListenerSetter();
  public tabs: {[t in ScrollableMenuTabType]: HTMLDivElement} = {} as any;
  menuList: HTMLElement;

  filterTab: IFilterTab;
  cropTab: ICropTab;


  public async init({onClose, canvaser}: IAppMediaEditorTabParams) {
    this.init = null;
    this.canvaser = canvaser;

    this.container.classList.add('media-editor-tab');

    // * header

    // ** close button
    // XENA TODO check why all this stuff it required (pasted from sharedMedia.ts:68)
    const newCloseBtn = Button('btn-icon sidebar-close-button', {noRipple: true});
    this.closeBtn.replaceWith(newCloseBtn);
    this.closeBtn = newCloseBtn;
    this.closeBtn.onclick = onClose;
    const animatedCloseIcon = document.createElement('div');
    animatedCloseIcon.classList.add('animated-close-icon');
    newCloseBtn.append(animatedCloseIcon);

    // ** undo
    this.undoBtn = Button('btn-icon', {
      icon: "undo",
    })
    this.undoBtn.onclick = () => this.canvaser.undo();
    this.header.append(this.undoBtn)

    // ** redo
    this.redoBtn = Button('btn-icon', {
      icon: "redo",
    })
    this.redoBtn.onclick = () => this.canvaser.redo();
    this.header.append(this.redoBtn)

    // ** title
    this.setTitle('Edit');
   
    this.createToolMenu();

    this.filterTab = this.createFilterTab();
    this.cropTab = this.createCropTab();

    this.tabs['filter'].append(this.filterTab.container);
    this.tabs['crop'].append(this.cropTab.container);
  }

  private createToolMenu() {

    this.mediaTabs = [{
      type: 'filter',
      icon: 'enhancebars',
    }, {
      type: 'crop',
      icon: 'crop',
    }, {
      type: 'text',
      icon: 'text',
    }, {
      type: 'paint',
      icon: 'brush',
    }, {
      type: 'emoji',
      icon: 'smile',
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
    for (const mediaTab of this.mediaTabs) {
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
    for (const mediaTab of this.mediaTabs) {
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

      {
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
      }

      this.prevTabId = id;
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

      this.onTransitionEnd();
    }, undefined, scrollableX, this.listenerSetter)
 

    const onTabClick = (type: ScrollableMenuTabType) => {
      const mediaTab = this.mediaTabs.find((mediaTab) => mediaTab.type === type);
    }
  
    this.tabs.crop && attachClickEvent(
      this.tabs.crop,
      onTabClick.bind(null, 'crop'),
      {listenerSetter: this.listenerSetter}
    )

    this.mediaTab = this.mediaTabs[0];
    (this.menuList.children[1] as HTMLElement).click();
  }

  private createFilterTab(): IFilterTab {

    const container = document.createElement('div');
    container.classList.add('editor-tab', 'filter', 'scrollable', 'scrollable-y')

    

    const enchance = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Enchance",
      1,
      0,
      this.canvaser.ENCHANCE_MIN,
      this.canvaser.ENCHANCE_MAX,
    );
    
    const brightness = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Brightness",
      1,
      0,
      this.canvaser.BRIGHTNESS_MIN,
      this.canvaser.BRIGHTNESS_MAX,
    );
    
    const contrast = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Contrast",
      1,
      0,
      this.canvaser.CONTRAST_MIN,
      this.canvaser.CONTRAST_MAX,
    );
    
    const saturation = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Saturation",
      1,
      0,
      this.canvaser.SATURATION_MIN,
      this.canvaser.SATURATION_MAX,
    );
    
    const warmth = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Warmth",
      1,
      0,
      this.canvaser.WARMTH_MIN,
      this.canvaser.WARMTH_MAX,
    );
    
    const fade = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Fade",
      1,
      0,
      this.canvaser.FADE_MIN,
      this.canvaser.FADE_MAX,
    );
    
    const highlights = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Highlights",
      1,
      0,
      this.canvaser.HIGHLIGHTS_MIN,
      this.canvaser.HIGHLIGHTS_MAX,
    );
    
    const shadows = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Shadows",
      1,
      0,
      this.canvaser.SHADOWS_MIN,
      this.canvaser.SHADOWS_MAX,
    );
    
    const vignette = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Vignette",
      1,
      0,
      this.canvaser.VIGNETTE_MIN,
      this.canvaser.VIGNETTE_MAX,
    );
    
    const grain = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Grain",
      1,
      0,
      this.canvaser.GRAIN_MIN,
      this.canvaser.GRAIN_MAX,
    );
    
    const sharpen = new RangeSettingSelector(
      // XENA TODO deal with i18n
      // @ts-ignore
      "Sharpen",
      1,
      0,
      this.canvaser.SHARPEN_MIN,
      this.canvaser.SHARPEN_MAX,
    );
    
    enchance.onChange = (value) => {
      this.canvaser.onEnchanceChange(value);
    };
    
    brightness.onChange = (value) => {
      this.canvaser.onBrightnessChange(value);
    };
    
    contrast.onChange = (value) => {
      this.canvaser.onContrastChange(value);
    };
    
    saturation.onChange = (value) => {
      this.canvaser.onSaturationChange(value);
    };
    
    warmth.onChange = (value) => {
      this.canvaser.onWarmthChange(value);
    };
    
    fade.onChange = (value) => {
      this.canvaser.onFadeChange(value);
    };
    
    highlights.onChange = (value) => {
      this.canvaser.onHighlightsChange(value);
    };
    
    shadows.onChange = (value) => {
      this.canvaser.onShadowsChange(value);
    };
    
    vignette.onChange = (value) => {
      this.canvaser.onVignetteChange(value);
    };
    
    grain.onChange = (value) => {
      this.canvaser.onGrainChange(value);
    };
    
    sharpen.onChange = (value) => {
      this.canvaser.onSharpenChange(value);
    };
    
    
    container.append(
      enchance.container  ,
      brightness.container,
      contrast.container,
      saturation.container,
      warmth.container,
      fade.container,
      highlights.container,
      shadows.container,
      vignette.container,
      grain.container,
      sharpen.container,
    );
  



    return { container, enchance, brightness, contrast, saturation, warmth, fade, highlights, shadows, vignette, grain, sharpen
    };
  }

  private createCropTab(): ICropTab {
    const container = document.createElement('div');
    container.classList.add('editor-tab', 'crop', 'scrollable', 'scrollable-y')

    // XENA TODO deal with i18n
    // @ts-ignore
    let section  = createNamedSection("Aspect Ratio")

    let free = new Row({
      icon: 'fullscreen',
      // XENA TODO deal with i18n
      // @ts-ignore
      titleLangArgs: 'Free',
      title: 'Free',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.free);
      }      
    })
    
    let original = new Row({
      icon: 'dragmedia',
      // XENA TODO deal with i18n
      // @ts-ignore
      titleLangArgs: 'Original',
      title: 'Original',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.original);
      }      
    })

    let square = new Row({
      icon: 'square',
      // XENA TODO deal with i18n
      // @ts-ignore
      titleLangArgs: 'Square',
      title: 'Square',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.square);
      }      
    })

    let partialsContainer = document.createElement('div');
    partialsContainer.classList.add('partials-container');

    let x3x2 = new Row({
      icon: 'size3x2',
      title: '3:2',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x3x2);
      }      
    })

    let x2x3 = new Row({
      icon: 'size3x2',
      title: '2:3',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x2x3);
      }      
    })
    x2x3.container.classList.add('rotated');

    let x4x3 = new Row({
      icon: 'size4x3',
      title: '4:3',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x4x3);
      }      
    })

    let x3x4 = new Row({
      icon: 'size4x3',
      title: '3:4',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x3x4);
      }      
    })
    x3x4.container.classList.add('rotated');


    let x5x4 = new Row({
      icon: 'size5x4',
      title: '5:4',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x5x4);
      }      
    })

    let x4x5 = new Row({
      icon: 'size5x4',
      title: '4:5',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x4x5);
      }      
    })
    x4x5.container.classList.add('rotated');


    let x7x5 = new Row({
      icon: 'size7x6',
      title: '7:5',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x7x5);
      }      
    })

    let x5x7 = new Row({
      icon: 'size7x6',
      title: '5:7',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x5x7);
      }      
    })
    x5x7.container.classList.add('rotated');

    let x16x9 = new Row({
      icon: 'size16x9',
      title: '16:9',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x16x9);
      }      
    })

    let x9x16 = new Row({
      icon: 'size16x9',
      title: '9:16',
      clickable: () => {
        this.canvaser.setAspectRatio(aspectRatios.x9x16);
      }      
    })
    x9x16 .container.classList.add('rotated');

    partialsContainer.append(
      x3x2.container,
      x2x3.container,
      x4x3.container,
      x3x4.container,
      x5x4.container,
      x4x5.container,
      x7x5.container,
      x5x7.container,
      x16x9.container,
      x9x16.container,
    )

    section.append(free.container,
      original.container,
      square.container,
      partialsContainer
    )

    container.append(section)

    return {container}
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
      position: 'start',
    });
  }
}

export function createNamedSection(name: LangPackKey): HTMLElement{

  const section = document.createElement('section');
  section.classList.add('named-section');
  const title = document.createElement('header');
  title.classList.add('named-section-title');
  title.append(i18n(name));
  section.append(title);

  return section
} 
