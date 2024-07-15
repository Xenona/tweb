import PopupElement from '.';
import Button from '../button';
import confirmationPopup from '../confirmationPopup';
import AppMediaEditorTab from '../sidebarRight/tabs/mediaEditor';
import SidebarSlider from '../slider';

export interface ICanvaser {
  undo: () => void,
  redo: () => void,
}

class Canvaser implements ICanvaser {
  private p(text: string) {
    console.log("XE", text)
  }
  public undo() {
    this.p('undo');
  }
  public redo() {
    this.p('redo')
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
