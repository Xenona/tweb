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
import ButtonIcon from "../../buttonIcon";
import ColorPicker from "../../colorPicker";
import { horizontalMenu } from "../../horizontalMenu";
import Icon from "../../icon";
import { AspectRatios as AspectRatios,  FontList,  FontsMap, ICanvaser } from "../../popups/mediaEditor";
import ripple from "../../ripple";
import Row, { createManyRows } from "../../row";
import { ScrollableX } from "../../scrollable";
import SettingSection from "../../settingSection";
import { ShortColorPicker } from "../../shortColorPicker";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";
import SliderSuperTab from "../../sliderTab";
import SwipeHandler from "../../swipeHandler";

export interface IAppMediaEditorTabParams {
  onClose: () => void,
  canvaser: ICanvaser,
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

  filterTab: FilterTab;
  cropTab: CropTab;
  textTab: TextTab;


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


    this.filterTab = new FilterTab(this.canvaser);
    this.cropTab = new CropTab(this.canvaser);
    this.textTab = new TextTab(this.canvaser)

    this.tabs['filter'].append(this.filterTab.container);
    this.tabs['crop'].append(this.cropTab.container);
    this.tabs['text'].append(this.textTab.container);
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

      // XENA TODO hacky hack, maybe there's a better option
      // this allows start creating text right when the tab is opened
      // also the element should be removed if unchanged and tab was
      // chanded
      if (id === 2) {
        this.canvaser.createFontElement();
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

      this.onTransitionEnd();
    }, undefined, scrollableX, this.listenerSetter)
 

    // const onTabClick = (type: ScrollableMenuTabType) => {
    //   const mediaTab = this.mediaTabs.find((mediaTab) => mediaTab.type === type);
    //   console.log("XE", mediaTab)
    // }
  
    // this.tabs.crop && attachClickEvent(
    //   this.tabs.crop,
    //   onTabClick.bind(null, 'crop'),
    //   {listenerSetter: this.listenerSetter}
    // )



    this.mediaTab = this.mediaTabs[0];
    (this.menuList.children[3] as HTMLElement).click();
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

export function setToolActive(toolsContainer: HTMLElement, tool: HTMLElement, className: string) {
  const c = toolsContainer.querySelectorAll(`.${className}`);
  for (let i = 0; i < c.length; i++) {
    if (c[i] instanceof HTMLElement) {
      c[i].classList.remove(className);

    }
  }
  tool.classList.add(className);
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

export function createFilterRangeSelectors(params: {name: LangPackKey, min: number, max: number, onChangeCb: (value: number) => void, }[]): RangeSettingSelector[] {
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

export class FilterTab {
  
  canvaser: ICanvaser;
  container: HTMLElement;

  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;


      this.container = document.createElement('div');
      this.container.classList.add('editor-tab', 'filter', 'scrollable', 'scrollable-y')
  
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
      ] = createFilterRangeSelectors([
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
  
      this.container.append(
        enhance.container,
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
  
  }
}

export class CropTab {
  
  canvaser: ICanvaser;
  container: HTMLElement
  
  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'crop', 'scrollable', 'scrollable-y')

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
    ] = createManyRows([
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

    this.container.append(section)

  }
}


export type Aligns = 'left' | 'center' | 'right';
export type Strokes = 'no' | 'yes' | 'frame';
export class TextTab {


  container: HTMLElement;
  canvaser: ICanvaser;
  alignmentContainer: HTMLElement;
  strokeContainer: HTMLElement;
  sizeRange: RangeSettingSelector;
  colorPicker: ShortColorPicker;
  fontSection: HTMLElement;

  constructor(canvaser: ICanvaser) {

    this.canvaser = canvaser;

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'text', 'scrollable', 'scrollable-y')
    this.container.style.setProperty('--range-color', '#ffffff')

    this.colorPicker = new ShortColorPicker();
    this.colorPicker.onChange = (color) => {
      this.canvaser.setFontColor(color.hex);
      this.container.style.setProperty('--range-color', color.hex);
      this.container.style.setProperty('--range-color-bleak', color.hex+'14');
    } 

    this.container.append(this.colorPicker.container)

    this.alignmentContainer = document.createElement('div');
    this.alignmentContainer.classList.add('tools');
    
    const alignLeft = ButtonIcon('alignleft');
    alignLeft.classList.add('tool');
    alignLeft.onclick = () => {
      this.canvaser.setFontAlignment('left');
      setToolActive(this.alignmentContainer, alignLeft, 'tool-selected');
    };
    const alignCenter = ButtonIcon('aligncentre');
    alignCenter.classList.add('tool');
    alignCenter.onclick = () => {
      this.canvaser.setFontAlignment('center');
      setToolActive(this.alignmentContainer, alignCenter, 'tool-selected');
    };
    const alignRight = ButtonIcon('alignright');
    alignRight.classList.add('tool');
    alignRight.onclick = () => {
      this.canvaser.setFontAlignment('right');
      setToolActive(this.alignmentContainer, alignRight, 'tool-selected');
    };
    
    // setToolActive(this.alignmentContainer, alignLeft, 'tool-selected');
    

    this.alignmentContainer.append(alignLeft, alignCenter, alignRight);

    this.strokeContainer = document.createElement('div');
    this.strokeContainer.classList.add('tools');
    
    const noStroke = ButtonIcon('noframe');
    noStroke.classList.add('tool');
    noStroke.onclick = () => {
      this.canvaser.setFontStroke("no");
      setToolActive(this.strokeContainer, noStroke, 'tool-selected');
    };
    
    const yesStroke = ButtonIcon('black');
    yesStroke.classList.add('tool');
    yesStroke.onclick = () => {
      this.canvaser.setFontStroke("yes");
      setToolActive(this.strokeContainer, yesStroke, 'tool-selected');
    };
    
    const frameStroke = ButtonIcon('white');
    frameStroke.classList.add('tool');
    frameStroke.onclick = () => {
      this.canvaser.setFontStroke('frame');
      setToolActive(this.strokeContainer, frameStroke, 'tool-selected');
    };
    // setToolActive(this.strokeContainer, noStroke, 'tool-selected');

    this.strokeContainer.append(noStroke, yesStroke, frameStroke);

    const toolContainer = document.createElement('div');
    toolContainer.classList.add('tools-container');
    toolContainer.append(this.alignmentContainer, this.strokeContainer);
    this.container.append(toolContainer)

    // XENA TODO deal with i18n
    // @ts-ignore
    this.fontSection = createNamedSection('Font')
    // XENA TODO deal with i18n
    // @ts-ignore
    this.sizeRange = new RangeSettingSelector("Size",
      1,
      24,
      16,
      48,
    )
    this.sizeRange.onChange = (value) => {
      this.canvaser.setTextSize(value);
    } 

    const [
      roboto,
      typewriter,
      avenirNext,
      courierNew,
      noteworthy,
      georgia,
      papyrus,
      snellRoundhand,
    ] = createManyRows([
      {
        title: "Roboto",
        className: "roboto",
        clickable: () => {
          setToolActive(this.fontSection, roboto.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.roboto);
        }
      },
      {
        title: "Typewriter",
        className: "typewriter",
        clickable: () => {
          setToolActive(this.fontSection, typewriter.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.typewriter);
        }
      },
      {
        title: "Avenir Next",
        className: "avenirNext",
        clickable: () => {
          setToolActive(this.fontSection, avenirNext.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.avenirNext);
        }
      },
      {
        title: "Courier New",
        className: "courierNew",
        clickable: () => {
          setToolActive(this.fontSection, courierNew.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.courierNew);
        }
      },
      {
        title: "Noteworthy",
        className: "noteworthy",
        clickable: () => {
          setToolActive(this.fontSection, noteworthy.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.noteworthy);
        }
      },
      {
        title: "Georgia",
        className: "georgia",
        clickable: () => {
          setToolActive(this.fontSection, georgia.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.georgia);
        }
      },
      {
        title: "Papyrus",
        className: "papyrus",
        clickable: () => {
          setToolActive(this.fontSection, papyrus.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.papyrus);
        }
      },
      {
        title: "Snell Roundhand",
        className: "snell-roundhand",
        clickable: () => {
          setToolActive(this.fontSection, snellRoundhand.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.snellRoundhand);
        }
      },
    ]);

    // setToolActive(this.fontSection, roboto.container, 'tool-selected');

    this.fontSection.append(
      roboto.container,
      typewriter.container,
      avenirNext.container,
      courierNew.container,
      noteworthy.container,
      georgia.container,
      papyrus.container,
      snellRoundhand.container)
    this.container.append(this.sizeRange.container, this.fontSection);

    this.setFontTabWithSettings({
      alignment: 'left',
      font: FontList[0],
      hexColor: "#FFFFFF",
      size: 24,
      stroke: 'no'
    })
  }

  public setFontTabWithSettings({alignment, hexColor, stroke, size, font}: {
    alignment: Aligns;
    hexColor: string; 
    stroke: Strokes;
    size: number, 
    font: string,
  }) {
    let id = 0
    if (alignment === 'center') id = 1;
    if (alignment === 'right') id = 2;
    setToolActive(this.alignmentContainer, this.alignmentContainer.children[id] as HTMLElement, 'tool-selected');
  
    id = 0;
    if (stroke === "yes") id = 1;
    if (stroke === "frame") id = 2;
    setToolActive(this.strokeContainer, this.strokeContainer.children[id] as HTMLElement, 'tool-selected');
    
    id = this.colorPicker.predefinedColors.indexOf(hexColor);
    if (id === -1) {
      this.colorPicker.clickCustomPick();
      setTimeout(() => this.colorPicker.setColor(hexColor), 0);
    } else {
      this.colorPicker.clickColorPick(
        this.colorPicker.colorPicks.children[id] as HTMLElement,
        hexColor
      )
    };

    id = FontList.indexOf(font);
    if (id === -1) {
      setToolActive(this.fontSection,
        this.fontSection.children[1] as HTMLElement,
        'tool-selected',
      )
    } else {
      setToolActive(this.fontSection, 
      this.fontSection.children[id+1] as HTMLElement, 'tool-selected')
    }

    this.sizeRange.setProgress(size);
  }
}
