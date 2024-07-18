import liteMode from "../helpers/liteMode";
import ColorPicker from "./colorPicker";

export class ShortColorPicker extends ColorPicker {

  boxAndInputs: HTMLElement;
  predefinedColors  = ['#FFFFFF', '#FE4438', '#FF8901', '#FFD60A', '#33C759', '#62E5E0', '#0A84FF', '#BD5CF3'];
  customColorPick: HTMLButtonElement;
  colorPicks: HTMLElement;
  
  constructor() {
    super({boxWidth: 200, boxHeight: 120, circlesR: 10, sliderH: 20, sliderW: 300, sliderRX: 10, sliderRY: 10});
    
    this.colorPicks = document.createElement('div');
    this.colorPicks.classList.add('color-picks');
    this.predefinedColors.forEach((color) => {
      const colorPick = document.createElement('button');
      colorPick.classList.add('color-pick');
      colorPick.style.setProperty('background-color', color);
      colorPick.onclick = () => {
       this.clickColorPick(colorPick, color);
      }
      this.colorPicks.append(colorPick);
    })
    this.colorPicks.children[0].classList.add('active');

    this.container.innerHTML = '';
    this.container.classList.add('short');

    this.customColorPick = document.createElement('button');
    this.customColorPick.classList.add('color-pick');
    this.boxAndInputs = document.createElement('div');
    if (liteMode.isAvailable("animations")) {
      this.boxAndInputs.style.transition = 'height 0.6s ease, padding 0.6s ease';
      this.elements.sliders.style.transition = 'transform 0.6s ease, opacity 0.5s ease';
    }
    this.customColorPick.onclick = () => {
      this.clickCustomPick()
    }
    this.colorPicks.append(this.customColorPick);

    const inputs = document.createElement('div');
    inputs.classList.add('inputs');
    inputs.append(this.hexInputField.container, this.rgbInputField.container);

    this.boxAndInputs.classList.add('box-and-inputs');
    this.boxAndInputs.append(this.elements.box, inputs)
 
    this.container.append(this.colorPicks, this.elements.sliders, this.boxAndInputs)
  }

  protected hidePicker() {
    this.boxAndInputs.classList.remove('active');
    this.elements.sliders.classList.remove('active');
  }

  protected showPicker() {
    this.boxAndInputs.classList.add('active');
    this.elements.sliders.classList.add('active');
  }
  
  public clickCustomPick() {
    const wasActive = this.colorPicks.querySelector('.active');
    if (wasActive instanceof HTMLElement) {
      if (wasActive === this.customColorPick) {
        this.hidePicker();
        this.colorPicks.children[0].classList.add('active');
        this.setColor('#FFFFFF')
        this.onChange(this.getCurrentColor());
      } else {

        this.setColor(wasActive.style.backgroundColor, true, true);
        this.customColorPick.classList.add('active');
        this.showPicker();
        
      }
      wasActive.classList.remove('active');
    }
  }

  public clickColorPick(colorPick: HTMLElement, color: string) {
    this.colorPicks.querySelector('.active').classList.remove('active');
    colorPick.classList.add('active')
    this.hidePicker();
    if (this.onChange) {
      this.setColor(color);
      this.onChange(this.getCurrentColor());
    }
  }
}
