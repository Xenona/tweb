import PopupElement from '.';
import confirmationPopup from '../confirmationPopup';

export default class PopupMediaEditor extends PopupElement {
  constructor(image: File) {
    super('popup-media-editor', {
      overlayClosable: true,
      isConfirmationNeededOnClose: () => {
        return confirmationPopup({
          titleLangKey: 'CancelPollAlertTitle',
          descriptionLangKey: 'CancelPollAlertText',
          button: {
            langKey: 'Discard',
            isDanger: true
          }
        });
      }
    })
  }
}
