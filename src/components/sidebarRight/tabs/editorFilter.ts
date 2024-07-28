import {LangPackKey} from '../../../lib/langPack';
import {Canvaser} from '../../canvaser/Canvaser';
import {NoneTool} from '../../canvaser/Tool';
import {RangeSettingSelector} from '../../sidebarLeft/tabs/generalSettings';

export class EditorFilterTab {
  canvaser: Canvaser;
  container: HTMLElement;
  brightness: RangeSettingSelector;
  contrast: RangeSettingSelector;
  curFilterTool: NoneTool;


  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
    this.curFilterTool = new NoneTool(this.canvaser)

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'filter', 'scrollable', 'scrollable-y')
    this.canvaser.setTool(new NoneTool(this.canvaser))

    const [
      // enhance,
      brightness,
      contrast,
      saturation,
      warmth,
      fade,
      highlights,
      shadows,
      vignette,
      grain,
      sharpen
    ] = createFilterRangeSelectors([
      // {
      //   // XENA TODO deal with i18n
      //   // @ts-ignore
      //   name: "Enhance",
      //   min: this.canvaser.rootEffects.contrast.getInfo().min,
      //   max: this.canvaser.rootEffects.contrast.getInfo().max,
      //   onChangeCb: (val: number) => this.canvaser.rootEffects.contrast.setValue(val),
      //   onFinish: () => this.canvaser.rootEffects.finishEdit(),
      // },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: 'Brightness',
        min: this.canvaser.rootEffects.brightness.getInfo().min,
        max: this.canvaser.rootEffects.brightness.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.brightness.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: 'Contrast',
        min: this.canvaser.rootEffects.contrast.getInfo().min,
        max: this.canvaser.rootEffects.contrast.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.contrast.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Saturation",
        min: this.canvaser.rootEffects.saturate.getInfo().min,
        max: this.canvaser.rootEffects.saturate.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.saturate.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Warmth",
        min: this.canvaser.rootEffects.warmth.getInfo().min,
        max: this.canvaser.rootEffects.warmth.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.warmth.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Fade",
        min: this.canvaser.rootEffects.fade.getInfo().min,
        max: this.canvaser.rootEffects.fade.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.fade.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Highlights",
        min: this.canvaser.rootEffects.highlights.getInfo().min,
        max: this.canvaser.rootEffects.highlights.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.highlights.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Shadows",
        min: this.canvaser.rootEffects.shadows.getInfo().min,
        max: this.canvaser.rootEffects.shadows.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.shadows.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      {
        // XENA TODO deal with i18n
        // @ts-ignore
        name: "Vignette",
        min: this.canvaser.rootEffects.vignette.getInfo().min,
        max: this.canvaser.rootEffects.vignette.getInfo().max,
        onChangeCb: (val: number) => this.canvaser.rootEffects.vignette.setValue(val),
        onFinish: () => this.canvaser.rootEffects.finishEdit()
      },
      // {
      //   // XENA TODO deal with i18n
      //   // @ts-ignore
      //   name: "Grain",
      //   min: this.canvaser.GRAIN_MIN,
      //   max: this.canvaser.GRAIN_MAX,
      //   onChangeCb: this.canvaser.onGrainChange.bind(this.canvaser),
      // },
      // {
      //   // XENA TODO deal with i18n
      //   // @ts-ignore
      //   name: "Sharpen",
      //   min: this.canvaser.SHARPEN_MIN,
      //   max: this.canvaser.SHARPEN_MAX,
      //   onChangeCb: this.canvaser.onSharpenChange.bind(this.canvaser),
      // },
    ]);

    this.brightness = brightness;
    this.contrast = contrast;

    this.container.append(
      // enhance.container,
      brightness.container,
      contrast.container,
      saturation.container,
      warmth.container,
      fade.container,
      highlights.container,
      shadows.container,
      vignette.container,
      // grain.container,
      // sharpen.container,
    );
  }

  public onUpdate(canvaser: Canvaser) {
    this.brightness.setProgress(canvaser.rootEffects.brightness.getState());
    this.contrast.setProgress(canvaser.rootEffects.contrast.getState());
  }
}

function createFilterRangeSelectors(params: {name: LangPackKey, min: number, max: number, onChangeCb: (value: number) => void, onFinish: () => void, }[]): RangeSettingSelector[] {
  const res: RangeSettingSelector[] = [];

  params.map((e) => {
    const range = new RangeSettingSelector(
      e.name,
      1,
      0.01,
      e.min,
      e.max
    )
    range.onChange = (value) => {
      if(value != 0) {
        range.valueContainer.classList.add('non-zero')
      } else {
        range.valueContainer.classList.remove('non-zero')
      }
      e.onChangeCb(value);
    }
    range.valueContainer.innerText = '0';
    res.push(range);
    range.onChangeRelease = () => {
      e.onFinish()
    }
  })

  return res;
}

