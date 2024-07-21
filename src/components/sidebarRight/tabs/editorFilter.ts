import { LangPackKey } from "../../../lib/langPack";
import { ICanvaser } from "../../popups/mediaEditor";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";

export class EditorFilterTab {
  
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

function createFilterRangeSelectors(params: {name: LangPackKey, min: number, max: number, onChangeCb: (value: number) => void, }[]): RangeSettingSelector[] {
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

