import PopupElement from '.';
import Button from '../button';
import confirmationPopup from '../confirmationPopup';
import AppMediaEditorTab from '../sidebarRight/tabs/mediaEditor';
import { Aligns, Strokes } from '../sidebarRight/tabs/editorText';
import SidebarSlider from '../slider';
import { Canvaser } from '../canvaser/Canvaser';


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
  'Roboto',
  'Typewriter',
  'Avenir Next',
  'Courier New Serif',
  'Noteworthy',
  'Georgia',
  'Papyrus',
  'Snell Roundhand',
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
 
export default class PopupMediaEditor extends PopupElement {

  acceptBtn: HTMLButtonElement;
  canvaser: Canvaser;
  gracefullyExiting: boolean = false;
  imageContainer: HTMLElement;
  cropRulerContainer: HTMLElement;
  canvasContainer: HTMLElement;

  // XENA TODO deal with the file
  constructor(image: HTMLImageElement) {
    super('popup-media-editor', {
      specialNavigationType: 'media-editor',
      overlayClosable: true,
      isConfirmationNeededOnClose: () => {
        
        if (this.canvaser.isHistoryEmpty) this.gracefullyExiting = true;
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
    
    this.imageContainer = document.createElement('div');
    this.imageContainer.classList.add('image-container')
    this.container.prepend(this.imageContainer)

    this.canvasContainer = document.createElement('div');
    this.cropRulerContainer = document.createElement('div');
    this.cropRulerContainer.classList.add('crop-ruler-container')
    this.imageContainer.append(this.canvasContainer, this.cropRulerContainer);

    
    const canvas = document.createElement('canvas')
    this.canvasContainer.className = 'canvas'
    this.canvasContainer.appendChild(canvas)
    
    this.canvaser = new Canvaser(canvas, image);

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
      .open({ canvaser: this.canvaser, onClose: () => this.hide(), cropRulerContainer: this.cropRulerContainer });
  }

  private saveEditedAndMoveBack() {
    // XENA TODO deal with files
    console.log("XE accepting, saving the file");
    this.gracefullyExiting = true;
    this.hide();
  }
}
