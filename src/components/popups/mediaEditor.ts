import PopupElement from '.';
import Button from '../button';
import confirmationPopup from '../confirmationPopup';
import AppActiveSessionsTab from '../sidebarLeft/tabs/activeSessions';
import AppMediaEditorTab, { Aligns, Strokes } from '../sidebarRight/tabs/mediaEditor';
import AppSharedMediaTab from '../sidebarRight/tabs/sharedMedia';
import SidebarSlider from '../slider';


export enum AspectRatios {
  "free",
  'original',
  'square',
  'x3x2',
  'x2x3',
  'x4x3',
  'x3x4',
  'x5x4',
  'x4x5',
  'x7x5',
  'x5x7',
  'x16x9',
  'x9x16',
} 

export const FontList: string[] = [
  'Roboto-Medium.woff2',
  'Typewriter_Normal.woff2',
  'AvenirNextCyr-BoldItalic.woff2',
  'Courier_New_Bold.woff2',
  'Noteworthy_Bold.woff2',
  'Georgia.woff2',
  'Papyrus.woff2',
  'snell_roundhand.woff2',
];

export const FontsMap = {
  roboto: FontList[0],
  typewriter: FontList[1],
  avenirNext: FontList[2],
  courierNew: FontList[3],
  noteworthy: FontList[4],
  georgia: FontList[5],
  papyrus: FontList[6],
  snellRoundhand: FontList[7],
} as const;

export enum Pens {
  pen,
  arrow,
  mark,
  neon,
  blur,
  eraser,
}

export interface ICanvaser {
  undo: () => void,
  redo: () => void,

  // all the values are pulled out of design
  onEnhanceChange: (value: number) => void;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onWarmthChange: (value: number) => void;
  onFadeChange: (value: number) => void;
  onHighlightsChange: (value: number) => void;
  onShadowsChange: (value: number) => void;
  onVignetteChange: (value: number) => void;
  onGrainChange: (value: number) => void;
  onSharpenChange: (value: number) => void;
  
  ENHANCE_MIN: number; // 0
  ENHANCE_MAX: number; // 100

  BRIGHTNESS_MIN: number; // -100
  BRIGHTNESS_MAX: number; // 100

  CONTRAST_MIN: number; // -100
  CONTRAST_MAX: number; // 100

  SATURATION_MIN: number; // -100
  SATURATION_MAX: number; // 100

  WARMTH_MIN: number; // -100
  WARMTH_MAX: number; // 100

  FADE_MIN: number; // 0
  FADE_MAX: number; // 100

  HIGHLIGHTS_MIN: number; // -100
  HIGHLIGHTS_MAX: number; // 100

  SHADOWS_MIN: number; // -100
  SHADOWS_MAX: number; // 100

  VIGNETTE_MIN: number; // 0
  VIGNETTE_MAX: number; // 100

  GRAIN_MIN: number; // 0
  GRAIN_MAX: number; // 100

  SHARPEN_MIN: number; // 0
  SHARPEN_MAX: number; // 100

  setAspectRatio: (ratio: AspectRatios) => void;

  setTextSize: (size: number) => void;
  createFontElement: () => void;
  setFont: (font: string) => void;
  setFontColor: (hex: string) => void;
  setFontAlignment: (alignment: Aligns) => void;
  setFontStroke: (stroke: Strokes) => void;

  setPenSize: (size: number) => void;
  setPenColor: (hex: string) => void;
  setPen: (pen: Pens) => void; 

}

class Canvaser implements ICanvaser {
  public ENHANCE_MIN = 0;
  public ENHANCE_MAX = 100;

  public BRIGHTNESS_MIN = -100;
  public BRIGHTNESS_MAX = 100;

  public CONTRAST_MIN = -100;
  public CONTRAST_MAX = 100;

  public SATURATION_MIN = -100;
  public SATURATION_MAX = 100;

  public WARMTH_MIN = -100;
  public WARMTH_MAX = 100;

  public FADE_MIN = 0;
  public FADE_MAX = 100;

  public HIGHLIGHTS_MIN = -100;
  public HIGHLIGHTS_MAX = 100;

  public SHADOWS_MIN = -100;
  public SHADOWS_MAX = 100;

  public VIGNETTE_MIN = 0;
  public VIGNETTE_MAX = 100;

  public GRAIN_MIN = 0;
  public GRAIN_MAX = 100;

  public SHARPEN_MIN = 0;
  public SHARPEN_MAX = 100;

  private p(...args: any[]) {
    console.log("XE", ...args);
  }
  public undo() {
    this.p("undo");
  }
  public redo() {
    this.p("redo");
  }
  public onEnhanceChange(value: number) {
    this.p("enchance changing", value);
  }

  public onBrightnessChange(value: number) {
    this.p("brightness changing", value);
  }

  public onContrastChange(value: number) {
    this.p("contrast changing", value);
  }

  public onSaturationChange(value: number) {
    this.p("saturation changing", value);
  }

  public onWarmthChange(value: number) {
    this.p("warmth changing", value);
  }

  public onFadeChange(value: number) {
    this.p("fade changing", value);
  }

  public onHighlightsChange(value: number) {
    this.p("highlights changing", value);
  }

  public onShadowsChange(value: number) {
    this.p("shadows changing", value);
  }

  public onVignetteChange(value: number) {
    this.p("vignette changing", value);
  }

  public onGrainChange(value: number) {
    this.p("grain changing", value);
  }

  public onSharpenChange(value: number) {
    this.p("sharpen changing", value);
  }

  public setAspectRatio(ratio: AspectRatios) {
    this.p("setting ratio", ratio);
  } 

  public setTextSize(size: number) {
    this.p('setting text size', size);
  }

  public setFont(font: string) {
    this.p('setting font to', font)
  }

  public setFontColor(hex: string) {
    this.p('setting font color to', hex);
  }

  public setFontAlignment(alignment: 'left' | 'center' | 'right') {
    this.p('setting font alignment to', alignment)
  }

  public setFontStroke(stroke: 'no' | 'yes' | 'frame') {
    this.p('setting font stroke to', stroke)
  }

  public createFontElement() {
    this.p('created font element');
  };

  public setPenSize(size: number) {
    this.p('setting pen size', size);
  }

  public setPenColor(hex: string) {
    this.p('setting pen color to', hex);
  }

  public setPen(pen: Pens) {
    this.p('settings pen', pen);
  }
}

export default class PopupMediaEditor extends PopupElement {

  acceptBtn: HTMLButtonElement;
  gracefullyExiting: boolean = false;

  // XENA TODO deal with the file
  constructor(image?: File) {
    super('popup-media-editor', {
      overlayClosable: true,
      isConfirmationNeededOnClose: () => {
        
        if (!this.gracefullyExiting) return confirmationPopup({
          
          // XENA TODO deal with i18n
          // @ts-ignore
          titleLangKey: 'Discard edited image',
          // XENA TODO deal with i18n
          // @ts-ignore
          descriptionLangKey: 'Are you sure you want to discard image you edited?',
          button: {
            langKey: 'Discard',
            isDanger: true
          }
        });
      }
    })

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container')
    this.container.prepend(imageContainer)

    const toolbarWrap = document.createElement('div');
    toolbarWrap.classList.add('sidebar-slider', 'tabs-container', 'toolbar-wrap')
    const sidebarContent = document.createElement('div');
    sidebarContent.classList.add(  'sidebar-content')
    toolbarWrap.append(sidebarContent);
    this.container.append(toolbarWrap);

    this.acceptBtn = Button('btn-circle rp btn-corner z-depth-1', {
      icon: 'check',
      noRipple: true, 
    })
    this.header.nextElementSibling.append(this.acceptBtn)
    this.acceptBtn.onclick = () => this.saveEditedAndMoveBack(); 

    const sidebar = new SidebarSlider({
      sidebarEl: (this.container as HTMLElement),
      navigationType: 'right',
      canHideFirst: false
    }); 

 
    sidebar
      .createTab(AppMediaEditorTab)
      .open({ canvaser: new Canvaser(), onClose: () => this.hide() });
  }

  private saveEditedAndMoveBack() {
    // XENA TODO deal with files
    console.log("XE accepting, saving the file");
    this.gracefullyExiting = true;
    this.hide();
  }
}
