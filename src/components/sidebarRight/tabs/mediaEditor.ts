import IS_TOUCH_SUPPORTED from "../../../environment/touchSupport";
import findUpClassName from "../../../helpers/dom/findUpClassName";
import handleTabSwipe from "../../../helpers/dom/handleTabSwipe";
import lockTouchScroll from "../../../helpers/dom/lockTouchScroll";
import ListenerSetter from "../../../helpers/listenerSetter";
import { AppManagers } from "../../../lib/appManagers/managers";
import { i18n, LangPackKey } from "../../../lib/langPack";
import rootScope from "../../../lib/rootScope";
import Button from "../../button";
import ButtonIcon from "../../buttonIcon";
import StickersTab from "../../emoticonsDropdown/tabs/stickers";
import { horizontalMenu } from "../../horizontalMenu";
import Icon from "../../icon";
import LazyLoadQueue from "../../lazyLoadQueue";
import { AspectRatios as AspectRatios,  FontList,  FontsMap, ICanvaser, Pens } from "../../popups/mediaEditor";
import ripple from "../../ripple";
import { createManyRows } from "../../row";
import { ScrollableX } from "../../scrollable";
import { ShortColorPicker } from "../../shortColorPicker";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";
import SliderSuperTab from "../../sliderTab";
import SwipeHandler from "../../swipeHandler";

export interface IAppMediaEditorTabParams {
  onClose: () => void,
  canvaser: ICanvaser,
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
  mediaTabs: ScrollableMenuTab[];
  mediaTab: ScrollableMenuTab;
  listenerSetter = new ListenerSetter();
  public tabs: {[t in ScrollableMenuTabType]: HTMLDivElement} = {} as any;
  menuList: HTMLElement;

  filterTab: FilterTab;
  cropTab: CropTab;
  textTab: TextTab;
  brushTab: BrushTab;
  emojiTab: ElmojiTab;

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
    this.textTab = new TextTab(this.canvaser);
    this.brushTab = new BrushTab(this.canvaser);
    this.emojiTab = new ElmojiTab(this.canvaser);

    this.tabs['filter'].append(this.filterTab.container);
    this.tabs['crop'].append(this.cropTab.container);
    this.tabs['text'].append(this.textTab.container);
    this.tabs['brush'].append(this.brushTab.container);
    this.tabs['emoji'].append(this.emojiTab.container);
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
      type: 'brush',
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
 
    this.mediaTab = this.mediaTabs[0];
    // XENA TODO hacky hack
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
          setToolActive(section, free.container, "tool-selected");
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
          setToolActive(section, original.container, "tool-selected");
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
          setToolActive(section, square.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "3:2",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x2);
          setToolActive(section, x3x2.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "2:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x2x3);
          setToolActive(section, x2x3.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size4x3",
        title: "4:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x3);
          setToolActive(section, x4x3.container, "tool-selected");
        },
      },
      {
        icon: "size4x3",
        title: "3:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x4);
          setToolActive(section, x3x4.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size5x4",
        title: "5:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x4);
          setToolActive(section, x5x4.container, "tool-selected");
        },
      },
      {
        icon: "size5x4",
        title: "4:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x5);
          setToolActive(section, x4x5.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size7x6",
        title: "7:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x7x5);
          setToolActive(section, x7x5.container, "tool-selected");
        },
      },
      {
        icon: "size7x6",
        title: "5:7",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x7);
          setToolActive(section, x5x7.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size16x9",
        title: "16:9",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x16x9);
          setToolActive(section, x16x9.container, "tool-selected");
        },
      },
      {
        icon: "size16x9",
        title: "9:16",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x9x16);
          setToolActive(section, x9x16.container, "tool-selected");
        },
        className: "rotated",
      },
    ]);
 
    setToolActive(section, free.container, 'tool-selected');

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

    this.colorPicker = new ShortColorPicker(
      (color) => {
        this.canvaser.setFontColor(color.hex);
        this.container.style.setProperty('--range-color', color.hex);
      } 
    );

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
    
    // XENA TODO
    // the color handle doesn't get a proper position,
    // though the color is set correctly
    this.colorPicker.setColor(hexColor);   

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

export type PenColorsCSS =  '--pen-color' | '--arrow-color' | '--mark-color' | '--neon-color' | ''
export class BrushTab {
  container: HTMLElement;
  canvaser: ICanvaser;
  colorPicker: ShortColorPicker;
  sizeRange: RangeSettingSelector;
  toolSection: HTMLElement;
  svgns: string = 'http://www.w3.org/2000/svg';
  currChangingPen: PenColorsCSS = '--pen-color'
  savedColors = {
    '--pen-color': "#FE4438",
    '--arrow-color': "#FFD60A",
    '--mark-color': "#FF8901",
    '--neon-color': "#62E5E0",
    '': '',
  }

  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;
    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'brush', 'scrollable', 'scrollable-y')

    this.colorPicker = new ShortColorPicker(
      (color) => {
        this.canvaser.setPenColor(color.hex);
        this.container.style.setProperty('--range-color', color.hex);
        this.container.style.setProperty(this.currChangingPen, color.hex);
        this.savedColors[this.currChangingPen] = color.hex;
      } 
    );

    // XENA TODO deal with i18n
    // @ts-ignore
    this.toolSection = createNamedSection('Tool')
    // XENA TODO deal with i18n
    // @ts-ignore
    this.sizeRange = new RangeSettingSelector("Size",
      1,
      15,
      1,
      30,
    )
    this.sizeRange.onChange = (value) => {
      this.canvaser.setPenSize(value);
    } 

    const [
      pen, 
      arrow,
      mark,
      neon,
      blur, 
      eraser
    ] = createManyRows([
      {
        title: "Pen",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Pen",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.pen, '--pen-color', pen.container);
        }
      },
      {
        title: "Arrow",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Arrow",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.arrow, '--arrow-color', arrow.container);
        }
      },
      {
        title: "Brush",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Brush",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.mark, '--mark-color', mark.container);
        }
      },
      {
        title: "Neon",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Neon",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.neon, '--neon-color', neon.container);
        }
      },
      {
        title: "Blur",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Blur",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.blur, '', blur.container);
          this.container.style.setProperty('--range-color', '#ffffff')
        }
      },
      {
        title: "Eraser",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Eraser",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(Pens.eraser, '', eraser.container);
          this.container.style.setProperty('--range-color', '#ffffff')
        }
      }
    ])

    pen.container.prepend( this.createPen())
    arrow.container.prepend(this.createArrow());
    mark.container.prepend(this.createMark());
    neon.container.prepend(this.createNeon());
    blur.container.prepend(this.createBlur());
    eraser.container.prepend(this.createEraser());

    this.toolSection.append(
      pen.container,
      arrow.container,
      mark.container,
      neon.container,
      blur.container,
      eraser.container,
    );

    setToolActive(this.toolSection, pen.container, 'tool-selected');
    this.colorPicker.setColor(this.colorPicker.predefinedColors[1])
    this.container.append(this.colorPicker.container, this.sizeRange.container, this.toolSection)
    
  }

  private onPenSelect(pen: Pens, variable: PenColorsCSS, container: HTMLElement) {
    this.canvaser.setPen(pen);
    setToolActive(this.toolSection, container, 'tool-selected');
    this.currChangingPen = variable
    this.colorPicker.setColor(this.savedColors[this.currChangingPen]);
  }

  public createPen() {
    const pen = document.createElementNS(this.svgns, 'svg');
    pen.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1291)">
      <g filter="url(#filter0_iiii_6189_1291)">
      <path d="M0 1H80L110.2 8.44653C112.048 8.90213 112.971 9.12994 113.185 9.49307C113.369 9.80597 113.369 10.194 113.185 10.5069C112.971 10.8701 112.048 11.0979 110.2 11.5535L80 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path class="pen" d="M112.564 10.9709L103.474 13.2132C103.21 13.2782 102.944 13.121 102.883 12.8566C102.736 12.2146 102.5 11.0296 102.5 10C102.5 8.9705 102.736 7.78549 102.883 7.14344C102.944 6.87906 103.21 6.72187 103.474 6.78685L112.564 9.02913C113.578 9.27925 113.578 10.7208 112.564 10.9709Z"/>
      <rect class="pen" x="76" y="1" width="4" height="18" rx="0.5"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1291" x="0" y="-4" width="116.323" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1291" result="effect2_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1291" result="effect3_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1291" result="effect4_innerShadow_6189_1291"/>
      </filter>
      <clipPath id="clip0_6189_1291">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>

    `
    return pen;
  }

  public createArrow() {
    const arrow = document.createElementNS(this.svgns, 'svg');
    arrow.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1354)">
      <path d="M94 10H110M110 10L104 4M110 10L104 16" stroke="url(#paint0_linear_6189_1354)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g filter="url(#filter0_iiii_6189_1354)">
      <path d="M0 1H92C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path class="arrow" d="M92 1V1C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19V19V1Z"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1354" x="0" y="-4" width="99" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1354" result="effect2_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1354" result="effect3_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1354" result="effect4_innerShadow_6189_1354"/>
      </filter>
      <linearGradient id="paint0_linear_6189_1354" x1="110" y1="10" x2="94" y2="10" gradientUnits="userSpaceOnUse">
      <stop class="arrow" offset="0.755" />
      <stop class="arrow" offset="1" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="clip0_6189_1354">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
    `
    return arrow;
  }

  public createMark() {
    const mark = document.createElementNS(this.svgns, 'svg');
    mark.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1365)">
      <g filter="url(#filter0_iiii_6189_1365)">
      <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <rect class="mark" x="76" y="1" width="4" height="18" rx="0.5" />
      <path class="mark" d="M102 5H106.434C106.785 5 107.111 5.1843 107.291 5.4855L112.091 13.4855C112.491 14.152 112.011 15 111.234 15H102V5Z"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1365" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1365" result="effect2_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1365" result="effect3_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1365" result="effect4_innerShadow_6189_1365"/>
      </filter>
      <clipPath id="clip0_6189_1365">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>

    `
    return mark;
  }

  public createNeon() {
    const neon = document.createElementNS(this.svgns, 'svg');
    neon.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1369)">
      <g filter="url(#filter0_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"/>
      </g>
      <g filter="url(#filter1_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" />
      </g>
      <g filter="url(#filter2_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" />
      </g>
      <g filter="url(#filter3_iiii_6189_1369)">
      <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <rect class="neon" x="76" y="1" width="4" height="18" rx="0.5"  />
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"  />
      </g>
      <defs>
      <filter id="filter0_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter1_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter2_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter3_iiii_6189_1369" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1369" result="effect2_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1369" result="effect3_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1369" result="effect4_innerShadow_6189_1369"/>
      </filter>
      <clipPath id="clip0_6189_1369">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
      `
    return neon;
  }

  public createBlur() {
    const blur = document.createElementNS(this.svgns, 'svg');
    blur.innerHTML =
    `
      <svg width="122" height="20" viewBox="0 0 122 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_iiii_6189_1380)">
      <path d="M0 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5V1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5V1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5V18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5V18.5C78.0968 18.8064 77.7836 19 77.441 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <g filter="url(#filter1_f_6189_1380)">
      <circle cx="107.5" cy="10.5" r="4.5" fill="white"/>
      <circle cx="107.5" cy="10.5" r="4.5" fill="url(#paint0_angular_6189_1380)"/>
      <circle cx="107.5" cy="10.5" r="4.5" fill="url(#paint1_radial_6189_1380)" fill-opacity="0.35"/>
      </g>
      <g filter="url(#filter2_f_6189_1380)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white"/>
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#paint2_angular_6189_1380)"/>
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#paint3_radial_6189_1380)" fill-opacity="0.35"/>
      </g>
      <mask id="mask0_6189_1380" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="1" width="100" height="18">
      <path d="M2 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5V1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5V1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5V18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5V18.5C78.0968 18.8064 77.7836 19 77.441 19H2V1Z" fill="#3E3F3F"/>
      </mask>
      <g mask="url(#mask0_6189_1380)">
      <path d="M79 19V1H78V19H79Z" fill="black" fill-opacity="0.33"/>
      <path d="M96 19V1H95V19H96Z" fill="black" fill-opacity="0.33"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1380" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1380" result="effect2_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1380" result="effect3_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1380" result="effect4_innerShadow_6189_1380"/>
      </filter>
      <filter id="filter1_f_6189_1380" x="98" y="1" width="19" height="19" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_6189_1380"/>
      </filter>
      <filter id="filter2_f_6189_1380" x="95.4215" y="0" width="21.5786" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_6189_1380"/>
      </filter>
      <radialGradient id="paint0_angular_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(107.5 10.5) rotate(90) scale(4.5)">
      <stop stop-color="#00DC4B"/>
      <stop offset="0.2" stop-color="#A717FF"/>
      <stop offset="0.345" stop-color="#DF3636"/>
      <stop offset="0.485" stop-color="#FF7A00"/>
      <stop offset="0.635" stop-color="#FFB800"/>
      <stop offset="0.775" stop-color="#EBFF00"/>
      <stop offset="1" stop-color="#00FFF0"/>
      </radialGradient>
      <radialGradient id="paint1_radial_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(107.5 10.5) rotate(100.317) scale(0.914791 0.827257)">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="white"/>
      </radialGradient>
      <radialGradient id="paint2_angular_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(106.211 10) rotate(90) scale(5 5.78927)">
      <stop stop-color="#00DC4B"/>
      <stop offset="0.2" stop-color="#A717FF"/>
      <stop offset="0.345" stop-color="#DF3636"/>
      <stop offset="0.485" stop-color="#FF7A00"/>
      <stop offset="0.635" stop-color="#FFB800"/>
      <stop offset="0.775" stop-color="#EBFF00"/>
      <stop offset="1" stop-color="#00FFF0"/>
      </radialGradient>
      <radialGradient id="paint3_radial_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(106.211 10) rotate(101.902) scale(1.02197 1.0585)">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="white"/>
      </radialGradient>
      </defs>
      </svg>
      `
    return blur;
  }

  public createEraser() {
    const eraser = document.createElementNS(this.svgns, 'svg');
    eraser.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1434)">
      <g filter="url(#filter0_i_6189_1434)">
      <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#D9D9D9"/>
      <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#F09B99"/>
      </g>
      <g filter="url(#filter1_iiii_6189_1434)">
      <path d="M0 1H77.6464C77.8728 1 78.0899 0.910072 78.25 0.75V0.75C78.4101 0.589928 78.6272 0.5 78.8536 0.5H96C97.1046 0.5 98 1.39543 98 2.5V17.5C98 18.6046 97.1046 19.5 96 19.5H78.8536C78.6272 19.5 78.4101 19.4101 78.25 19.25V19.25C78.0899 19.0899 77.8728 19 77.6464 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path d="M79 19.5V0.5L78 0.5V19.5H79Z" fill="black" fill-opacity="0.33"/>
      </g>
      <defs>
      <filter id="filter0_i_6189_1434" x="95" y="-1" width="19" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="2" dy="-2"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1434"/>
      </filter>
      <filter id="filter1_iiii_6189_1434" x="0" y="-4.5" width="101" height="29" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1434" result="effect2_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1434" result="effect3_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1434" result="effect4_innerShadow_6189_1434"/>
      </filter>
      <clipPath id="clip0_6189_1434">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
    `
    return eraser;
  }


}

export class ElmojiTab {
  
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

    const t = new StickersTab(this.managers)
      // t.container = this.container
    t.attachedLazyLoadQueue = lazyLoadQueue
    t.getContainerSize = () => {
      const b  = this.container.getBoundingClientRect()
      return {
        width: b.width,
        height: b.height
      }
    }
    t.container.classList.add('active')
    this.container.append(t.container)
    t.init();
  }
}
