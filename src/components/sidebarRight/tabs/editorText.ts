import ButtonIcon from '../../buttonIcon';
import {FontList, FontsMap} from '../../popups/mediaEditor';
import {createManyRows} from '../../row';
import {ShortColorPicker} from '../../shortColorPicker';
import {RangeSettingSelector} from '../../sidebarLeft/tabs/generalSettings';
import {createNamedSection, setToolActive} from './mediaEditor';
import {Canvaser} from '../../canvaser/Canvaser';
import {TextLayer, TextOptions} from '../../canvaser/Text';
import {NoneTool} from '../../canvaser/Tool';


export const SIZE_MULTIPLIER = 5;
export type Aligns = 'left' | 'center' | 'right';
export type Strokes = 'normal' | 'stroke' | 'shield';
export class EditorTextTab {
  container: HTMLElement;
  canvaser: Canvaser;
  alignmentContainer: HTMLElement;
  strokeContainer: HTMLElement;
  sizeRange: RangeSettingSelector;
  colorPicker: ShortColorPicker;
  fontSection: HTMLElement;
  textEntered: string;
  curTextTool: NoneTool;
  input: HTMLTextAreaElement;

  constructor(canvaser: Canvaser, verifyDeleteBtn: (show: boolean) => void) {
    this.canvaser = canvaser;
    this.curTextTool = new NoneTool(this.canvaser);
    this.curTextTool.onOrOutLayoutClickAction = (action: 'on' | 'out') => {
      if(action === 'on') {
        if(this.canvaser.focusedLayer instanceof TextLayer) {
          const {align, color, font, mode, size, text} = this.canvaser.focusedLayer.getText();
          this.setFontTabWithSettings({
            text: text,
            alignment: align,
            font: font,
            hexColor: color,
            size: Math.round(size/SIZE_MULTIPLIER),
            stroke: mode

          })
          verifyDeleteBtn(true)
        }
      } else {
          verifyDeleteBtn(false)
          this.setFontTabWithSettings({
          text: '',
          alignment: 'left',
          font: FontList[0],
          hexColor: '#FFFFFF',
          size: 24,
          stroke: 'normal'
        })
      }
    }

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'text', 'scrollable', 'scrollable-y')
    this.container.style.setProperty('--range-color', '#ffffff')

    this.colorPicker = new ShortColorPicker(
      (color) => {
        this.setTextInfo({color: color.hex});
        this.container.style.setProperty('--range-color', color.hex);
      }
    );

    this.container.append(this.colorPicker.container)


    this.alignmentContainer = document.createElement('div');
    this.alignmentContainer.classList.add('tools');

    const alignLeft = ButtonIcon('alignleft');
    alignLeft.classList.add('tool');
    alignLeft.onclick = () => {
      this.setTextInfoHist({align: 'left'});
      setToolActive(this.alignmentContainer, alignLeft, 'tool-selected');
    };
    const alignCenter = ButtonIcon('aligncentre');
    alignCenter.classList.add('tool');
    alignCenter.onclick = () => {
      this.setTextInfoHist({align: 'center'});
      setToolActive(this.alignmentContainer, alignCenter, 'tool-selected');
    };
    const alignRight = ButtonIcon('alignright');
    alignRight.classList.add('tool');
    alignRight.onclick = () => {
      this.setTextInfoHist({align: 'right'})
      setToolActive(this.alignmentContainer, alignRight, 'tool-selected');
    };

    this.alignmentContainer.append(alignLeft, alignCenter, alignRight);

    this.strokeContainer = document.createElement('div');
    this.strokeContainer.classList.add('tools');

    const noStroke = ButtonIcon('noframe');
    noStroke.classList.add('tool');
    noStroke.onclick = () => {
      this.setTextInfoHist({mode: 'normal'});
      setToolActive(this.strokeContainer, noStroke, 'tool-selected');
    };

    const yesStroke = ButtonIcon('black');
    yesStroke.classList.add('tool');
    yesStroke.onclick = () => {
      this.setTextInfoHist({mode: 'stroke'});
      setToolActive(this.strokeContainer, yesStroke, 'tool-selected');
    };

    const frameStroke = ButtonIcon('white');
    frameStroke.classList.add('tool');
    frameStroke.onclick = () => {
      this.setTextInfoHist({mode: 'shield'});
      setToolActive(this.strokeContainer, frameStroke, 'tool-selected');
    };

    this.strokeContainer.append(noStroke, yesStroke, frameStroke);

    const toolContainer = document.createElement('div');
    toolContainer.classList.add('tools-container');
    toolContainer.append(this.alignmentContainer, this.strokeContainer);
    this.container.append(toolContainer)

    this.input = document.createElement('textarea');
    this.input.addEventListener('input', (ev: any) => {
      if(!(this.canvaser.focusedLayer instanceof TextLayer)) {
        verifyDeleteBtn(true);
        this.canvaser.addLayer(new TextLayer(this.canvaser, ev.target.value));
      }
      this.setTextInfoHist({text: ev.target.value});
    }, true);
    this.input.classList.add('input-field-input');
    this.input.style.minWidth = '100%';
    this.input.style.maxHeight = '300px';
    const inputWrap = document.createElement('div');
    inputWrap.classList.add('input-field');
    inputWrap.append(this.input);

    // XENA TODO deal with i18n
    // @ts-ignore
    const textSection = createNamedSection('Text')
    textSection.append(inputWrap);
    this.container.append(textSection);

    // XENA TODO deal with i18n
    // @ts-ignore
    this.fontSection = createNamedSection('Font')
    // XENA TODO deal with i18n
    // @ts-ignore
    this.sizeRange = new RangeSettingSelector('Size',
      1,
      24,
      16,
      48
    )
    this.sizeRange.onChange = (value) => {
      this.setTextInfo({size: value*SIZE_MULTIPLIER});
    }
    this.sizeRange.onChangeRelease = () => {
      this.emitTextHist()
    }

    const [
      roboto,
      typewriter,
      avenirNext,
      courierNew,
      noteworthy,
      georgia,
      papyrus,
      snellRoundhand
    ] = createManyRows([
      {
        title: 'Roboto',
        className: 'roboto',
        clickable: () => {
          setToolActive(this.fontSection, roboto.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.roboto});
        }
      },
      {
        title: 'Typewriter',
        className: 'typewriter',
        clickable: () => {
          setToolActive(this.fontSection, typewriter.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.typewriter});
        }
      },
      {
        title: 'Avenir Next',
        className: 'avenirNext',
        clickable: () => {
          setToolActive(this.fontSection, avenirNext.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.avenirNext});
        }
      },
      {
        title: 'Courier New',
        className: 'courierNew',
        clickable: () => {
          setToolActive(this.fontSection, courierNew.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.courierNew});
        }
      },
      {
        title: 'Noteworthy',
        className: 'noteworthy',
        clickable: () => {
          setToolActive(this.fontSection, noteworthy.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.noteworthy});
        }
      },
      {
        title: 'Georgia',
        className: 'georgia',
        clickable: () => {
          setToolActive(this.fontSection, georgia.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.georgia});
        }
      },
      {
        title: 'Papyrus',
        className: 'papyrus',
        clickable: () => {
          setToolActive(this.fontSection, papyrus.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.papyrus});
        }
      },
      {
        title: 'Snell Roundhand',
        className: 'snell-roundhand',
        clickable: () => {
          setToolActive(this.fontSection, snellRoundhand.container, 'tool-selected');
          this.setTextInfo({font: FontsMap.snellRoundhand});
        }
      }
    ]);

    this.fontSection.append(
      roboto.container,
      typewriter.container,
      avenirNext.container,
      courierNew.container,
      noteworthy.container,
      georgia.container,
      papyrus.container,
      snellRoundhand.container)
    this.container.append(this.sizeRange.container, this.fontSection);

    this.setDefault()
  }

  public setDefault() {
    this.setFontTabWithSettings({
      text: '',
      alignment: 'left',
      font: FontList[0],
      hexColor: '#FFFFFF',
      size: 24,
      stroke: 'normal'
    })
  }

  public onUpdate(canvaser: Canvaser) {
    if (canvaser?.focusedLayer instanceof TextLayer) {
      if(this.canvaser.focusedLayer instanceof TextLayer) {
        const {align, color, font, mode, size, text} = this.canvaser.focusedLayer.getText();
        this.setFontTabWithSettings({
          text: text,
          alignment: align,
          font: font,
          hexColor: color,
          size: Math.round(size/SIZE_MULTIPLIER),
          stroke: mode

        })
      }
    } else {
      this.setDefault();
    }
  }

  public setFontTabWithSettings({alignment, hexColor, stroke, size, font, text}: {
    text: string,
    alignment: Aligns;
    hexColor: string;
    stroke: Strokes;
    size: number,
    font: string,
  }) {
    this.input.value = text;

    let id = 0
    if(alignment === 'center') id = 1;
    if(alignment === 'right') id = 2;
    setToolActive(this.alignmentContainer, this.alignmentContainer.children[id] as HTMLElement, 'tool-selected');

    id = 0;
    if(stroke === 'stroke') id = 1;
    if(stroke === 'shield') id = 2;
    setToolActive(this.strokeContainer, this.strokeContainer.children[id] as HTMLElement, 'tool-selected');

    this.colorPicker.setColor(hexColor);

    id = FontList.indexOf(font);
    if(id === -1) {
      setToolActive(this.fontSection,
        this.fontSection.children[1] as HTMLElement,
        'tool-selected'
      )
    } else {
      setToolActive(this.fontSection,
      this.fontSection.children[id+1] as HTMLElement, 'tool-selected')
    }

    this.sizeRange.setProgress(size);
  }

  private setTextInfo(o: Partial<TextOptions>) {
    if(this.canvaser.focusedLayer instanceof TextLayer) {
      this.canvaser.focusedLayer.updateText(o)
    }
  }

  private emitTextHist() {
    if(this.canvaser.focusedLayer instanceof TextLayer) {
      this.canvaser.focusedLayer.emitHistory();
    }
  }

  private setTextInfoHist(o: Partial<TextOptions>) {
    if(this.canvaser.focusedLayer instanceof TextLayer) {
      this.canvaser.focusedLayer.updateText(o)
      this.canvaser.focusedLayer.emitHistory();
    }
  }
}
