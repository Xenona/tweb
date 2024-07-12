import PopupElement from ".";

export default class PopupLimitReached extends PopupElement {

  constructor() {
    super('popup-limit-reached', {
      overlayClosable: true, 
    })
  }
}
