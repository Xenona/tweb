import PopupElement from ".";
import appImManager from "../../lib/appManagers/appImManager";
import LimitLine from "../limit";

export default class PopupLimitReached extends PopupElement {

  constructor() {
    super('popup-limit-reached', {
      overlayClosable: true, 
      title: 'LimitReached',
      body: true,
      buttons: [{
        langKey: "IncreaseLimit",
        iconRight: "premium_addone",
        callback: () => {
          this.managers.appPaymentsManager.getPremiumPromo().then((val) => {
            const options = val.period_options[0];
            appImManager.openUrl(options.bot_url);
          })
        }
      }, {
        langKey: 'Cancel',
      }]
    })

    const limitStuff = new LimitLine({
      limitPremium: 4,
      hint: {
        icon: 'newprivate_filled',
        content: "3"
      }
    })
    limitStuff.setProgress(0.5);
    limitStuff.setHintActive();

    this.body.append(limitStuff.container)
    this.body.innerHTML += `<p>You have reached the limit of <strong>3</strong> connected accounts. You can add more by subscribing to <strong>Telegram Premium</strong>.</p>` 
  }
}
