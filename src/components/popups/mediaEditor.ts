import PopupElement from '.';
import Button from '../button';
import confirmationPopup from '../confirmationPopup';
import AppMediaEditorTab from '../sidebarRight/tabs/mediaEditor';
import SidebarSlider from '../slider';

export interface ICanvaser {
  undo: () => void,
  redo: () => void,
  
  // all the values are pulled out of design

  ENCHANCE_MIN: number; // 0
  ENCHANCE_MAX: number; // 100
  onEnchanceChange: (value: number) => void;
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
}

class Canvaser implements ICanvaser {
  public ENCHANCE_MIN = 0;
  public ENCHANCE_MAX = 100;

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

  private p(text: string) {
    console.log("XE", text);
  }
  public undo() {
    this.p("undo");
  }
  public redo() {
    this.p("redo");
  }
  public onEnchanceChange(value: number) {
    this.p("enchance changing");
  }

      public onBrightnessChange(value: number) {
        this.p("brightness changing");
      }

      public onContrastChange(value: number) {
        this.p("contrast changing");
      }

      public onSaturationChange(value: number) {
        this.p("saturation changing");
      }

      public onWarmthChange(value: number) {
        this.p("warmth changing");
      }

      public onFadeChange(value: number) {
        this.p("fade changing");
      }

      public onHighlightsChange(value: number) {
        this.p("highlights changing");
      }

      public onShadowsChange(value: number) {
        this.p("shadows changing");
      }

      public onVignetteChange(value: number) {
        this.p("vignette changing");
      }

      public onGrainChange(value: number) {
        this.p("grain changing");
      }

      public onSharpenChange(value: number) {
        this.p("sharpen changing");
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
    this.header.nextElementSibling.append(this.acceptBtn  )
    this.acceptBtn.onclick = () => this.saveEditedAndMoveBack(); 

    const sidebar = new SidebarSlider({
      sidebarEl: (this.container as HTMLElement),
      navigationType: 'right',
      canHideFirst: false
    }); 

 
    // sidebar.createTab(AppSharedMediaTab).open()
    sidebar
      .createTab(AppMediaEditorTab)
      .open({ canvaser: new Canvaser(), onClose: () => this.hide() });


    // this.container.append(sidebar/)
  }

  private saveEditedAndMoveBack() {
    // XENA TODO deal with files
    console.log("XE accepting, saving the file");
    this.gracefullyExiting = true;
    this.hide();
  }

}
