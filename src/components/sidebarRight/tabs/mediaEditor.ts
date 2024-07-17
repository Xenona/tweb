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
import { aspectRatios as AspectRatios, ICanvaser } from "../../popups/mediaEditor";
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
  enhance: RangeSettingSelector;
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

    // XENA TODO fix value 0

    const [
      enhance,
      brightness,
      contrast,
      saturation,
      warmth,
      fade,
      highlights,
      shadows,
      vignette,
      grain,
      sharpen,
    ] = this.createFilterRangeSelectors([
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Enhance",
        min: this.canvaser.ENHANCE_MIN,
        max: this.canvaser.ENHANCE_MAX,
        onChangeCb: this.canvaser.onEnhanceChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Brightness",
        min: this.canvaser.BRIGHTNESS_MIN,
        max: this.canvaser.BRIGHTNESS_MAX,
        onChangeCb: this.canvaser.onBrightnessChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Contrast",
        min: this.canvaser.CONTRAST_MIN,
        max: this.canvaser.CONTRAST_MAX,
        onChangeCb: this.canvaser.onContrastChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Saturation",
        min: this.canvaser.SATURATION_MIN,
        max: this.canvaser.SATURATION_MAX,
        onChangeCb: this.canvaser.onSaturationChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Warmth",
        min: this.canvaser.WARMTH_MIN,
        max: this.canvaser.WARMTH_MAX,
        onChangeCb: this.canvaser.onWarmthChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Fade",
        min: this.canvaser.FADE_MIN,
        max: this.canvaser.FADE_MAX,
        onChangeCb: this.canvaser.onFadeChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Highlights",
        min: this.canvaser.HIGHLIGHTS_MIN,
        max: this.canvaser.HIGHLIGHTS_MAX,
        onChangeCb: this.canvaser.onHighlightsChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Shadows",
        min: this.canvaser.SHADOWS_MIN,
        max: this.canvaser.SHADOWS_MAX,
        onChangeCb: this.canvaser.onShadowsChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Vignette",
        min: this.canvaser.VIGNETTE_MIN,
        max: this.canvaser.VIGNETTE_MAX,
        onChangeCb: this.canvaser.onVignetteChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Grain",
        min: this.canvaser.GRAIN_MIN,
        max: this.canvaser.GRAIN_MAX,
        onChangeCb: this.canvaser.onGrainChange.bind(this.canvaser),
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Sharpen",
        min: this.canvaser.SHARPEN_MIN,
        max: this.canvaser.SHARPEN_MAX,
        onChangeCb: this.canvaser.onSharpenChange.bind(this.canvaser),
      },
    ]);

    container.append(
      enhance.container  ,
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

    return { container, enhance, brightness, contrast, saturation, warmth, fade, highlights, shadows, vignette, grain, sharpen
    };
  }

  private createCropTab(): ICropTab {
    const container = document.createElement('div');
    container.classList.add('editor-tab', 'crop', 'scrollable', 'scrollable-y')

    // XENA TODO deal with i18n
    // @ts-ignore
    let section  = createNamedSection("Aspect Ratio")

    const [
      free,
      original,
      square,
      x3x2,
      x2x3,
      x4x3,
      x3x4,
      x5x4,
      x4x5,
      x7x5,
      x5x7,
      x16x9,
      x9x16,
    ] = this.createCropInfoRow([
      {
        icon: "fullscreen",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Free",
        title: "Free",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.free);
        },
      },
      {
        icon: "dragmedia",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Original",
        title: "Original",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.original);
        },
      },
      {
        icon: "square",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Square",
        title: "Square",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.square);
        },
      },
      {
        icon: "size3x2",
        title: "3:2",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x2);
        },
      },
      {
        icon: "size3x2",
        title: "2:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x2x3);
        },
        className: "rotated",
      },
      {
        icon: "size4x3",
        title: "4:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x3);
        },
      },
      {
        icon: "size4x3",
        title: "3:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x4);
        },
        className: "rotated",
      },
      {
        icon: "size5x4",
        title: "5:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x4);
        },
      },
      {
        icon: "size5x4",
        title: "4:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x5);
        },
        className: "rotated",
      },
      {
        icon: "size7x6",
        title: "7:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x7x5);
        },
      },
      {
        icon: "size7x6",
        title: "5:7",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x7);
        },
        className: "rotated",
      },
      {
        icon: "size16x9",
        title: "16:9",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x16x9);
        },
      },
      {
        icon: "size16x9",
        title: "9:16",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x9x16);
        },
        className: "rotated",
      },
    ]);
 
    let partialsContainer = document.createElement('div');
    partialsContainer.classList.add('partials-container');

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
   
  private createCropInfoRow(params: {
    icon: Icon,
    title: string,
    clickable?: () => void,
    titleLangArgs?: any[],
    className?: string,
  }[]): Row[] {
    let res: Row[] = [];

    params.map(e => {
      let {className, ...options } = e;
      let row = new Row({
        ...options,
      })
      if (className) {
        row.container.classList.add(className);
      }
      res.push(row);
    })

    return res;
  }


  private createFilterRangeSelectors(params: {name: LangPackKey, min: number, max: number, onChangeCb: (value: number) => void, }[]): RangeSettingSelector[] {
    let res: RangeSettingSelector[] = [];

    params.map((e) => {
      let range = new RangeSettingSelector(
        e.name, 
        1,
        0,
        e.min,
        e.max,
      )
      range.onChange = (value) => {
        if (value != 0) {
          range.valueContainer.classList.add('non-zero')
        } else {
          range.valueContainer.classList.remove('non-zero')
        }
        e.onChangeCb(value);
      }
      res.push(range);
    }) 

    return res;
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
