import { data } from "autoprefixer";
import ButtonIcon from "../../buttonIcon";
import { FontList, FontsMap, ICanvaser } from "../../popups/mediaEditor";
import { createManyRows } from "../../row";
import { ShortColorPicker } from "../../shortColorPicker";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";
import { createNamedSection, setToolActive } from "./mediaEditor";


export type Aligns = 'left' | 'center' | 'right';
export type Strokes = 'no' | 'yes' | 'frame';
export class EditorTextTab {

  container: HTMLElement;
  canvaser: ICanvaser;
  alignmentContainer: HTMLElement;
  strokeContainer: HTMLElement;
  sizeRange: RangeSettingSelector;
  colorPicker: ShortColorPicker;
  fontSection: HTMLElement;
  textEntered: string;

  constructor(canvaser: ICanvaser) {

    this.canvaser = canvaser;

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'text', 'scrollable', 'scrollable-y')
    this.container.style.setProperty('--range-color', '#ffffff')

    this.colorPicker = new ShortColorPicker(
      (color) => {
        this.canvaser.setFontColor(color.hex);
        this.container.style.setProperty('--range-color', color.hex);
      } 
    );

    this.container.append(this.colorPicker.container)
 
 
    this.alignmentContainer = document.createElement('div');
    this.alignmentContainer.classList.add('tools');
    
    const alignLeft = ButtonIcon('alignleft');
    alignLeft.classList.add('tool');
    alignLeft.onclick = () => {
      this.canvaser.setFontAlignment('left');
      setToolActive(this.alignmentContainer, alignLeft, 'tool-selected');
    };
    const alignCenter = ButtonIcon('aligncentre');
    alignCenter.classList.add('tool');
    alignCenter.onclick = () => {
      this.canvaser.setFontAlignment('center');
      setToolActive(this.alignmentContainer, alignCenter, 'tool-selected');
    };
    const alignRight = ButtonIcon('alignright');
    alignRight.classList.add('tool');
    alignRight.onclick = () => {
      this.canvaser.setFontAlignment('right');
      setToolActive(this.alignmentContainer, alignRight, 'tool-selected');
    };
    
    this.alignmentContainer.append(alignLeft, alignCenter, alignRight);

    this.strokeContainer = document.createElement('div');
    this.strokeContainer.classList.add('tools');
    
    const noStroke = ButtonIcon('noframe');
    noStroke.classList.add('tool');
    noStroke.onclick = () => {
      this.canvaser.setFontStroke("no");
      setToolActive(this.strokeContainer, noStroke, 'tool-selected');
    };
    
    const yesStroke = ButtonIcon('black');
    yesStroke.classList.add('tool');
    yesStroke.onclick = () => {
      this.canvaser.setFontStroke("yes");
      setToolActive(this.strokeContainer, yesStroke, 'tool-selected');
    };
    
    const frameStroke = ButtonIcon('white');
    frameStroke.classList.add('tool');
    frameStroke.onclick = () => {
      this.canvaser.setFontStroke('frame');
      setToolActive(this.strokeContainer, frameStroke, 'tool-selected');
    };

    this.strokeContainer.append(noStroke, yesStroke, frameStroke);

    const toolContainer = document.createElement('div');
    toolContainer.classList.add('tools-container');
    toolContainer.append(this.alignmentContainer, this.strokeContainer);
    this.container.append(toolContainer)

    const input = document.createElement('textarea');
    input.addEventListener('input', (ev: any) => {

      this.canvaser.onTextChange(ev.target.value);
    }, false);
    input.classList.add('input-field-input');
    const inputWrap = document.createElement('div');
    inputWrap.classList.add('input-field');
    inputWrap.append(input);
    
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
    this.sizeRange = new RangeSettingSelector("Size",
      1,
      24,
      16,
      48,
    )
    this.sizeRange.onChange = (value) => {
      this.canvaser.setTextSize(value);
    } 

    const [
      roboto,
      typewriter,
      avenirNext,
      courierNew,
      noteworthy,
      georgia,
      papyrus,
      snellRoundhand,
    ] = createManyRows([
      {
        title: "Roboto",
        className: "roboto",
        clickable: () => {
          setToolActive(this.fontSection, roboto.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.roboto);
        }
      },
      {
        title: "Typewriter",
        className: "typewriter",
        clickable: () => {
          setToolActive(this.fontSection, typewriter.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.typewriter);
        }
      },
      {
        title: "Avenir Next",
        className: "avenirNext",
        clickable: () => {
          setToolActive(this.fontSection, avenirNext.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.avenirNext);
        }
      },
      {
        title: "Courier New",
        className: "courierNew",
        clickable: () => {
          setToolActive(this.fontSection, courierNew.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.courierNew);
        }
      },
      {
        title: "Noteworthy",
        className: "noteworthy",
        clickable: () => {
          setToolActive(this.fontSection, noteworthy.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.noteworthy);
        }
      },
      {
        title: "Georgia",
        className: "georgia",
        clickable: () => {
          setToolActive(this.fontSection, georgia.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.georgia);
        }
      },
      {
        title: "Papyrus",
        className: "papyrus",
        clickable: () => {
          setToolActive(this.fontSection, papyrus.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.papyrus);
        }
      },
      {
        title: "Snell Roundhand",
        className: "snell-roundhand",
        clickable: () => {
          setToolActive(this.fontSection, snellRoundhand.container, 'tool-selected');
          this.canvaser.setFont(FontsMap.snellRoundhand);
        }
      },
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

    this.setFontTabWithSettings({
      alignment: 'left',
      font: FontList[0],
      hexColor: "#FFFFFF",
      size: 24,
      stroke: 'no'
    })
  }

  public setFontTabWithSettings({alignment, hexColor, stroke, size, font}: {
    alignment: Aligns;
    hexColor: string; 
    stroke: Strokes;
    size: number, 
    font: string,
  }) {
    let id = 0
    if (alignment === 'center') id = 1;
    if (alignment === 'right') id = 2;
    setToolActive(this.alignmentContainer, this.alignmentContainer.children[id] as HTMLElement, 'tool-selected');
  
    id = 0;
    if (stroke === "yes") id = 1;
    if (stroke === "frame") id = 2;
    setToolActive(this.strokeContainer, this.strokeContainer.children[id] as HTMLElement, 'tool-selected');
    
    // XENA TODO
    // the color handle doesn't get a proper position,
    // though the color is set correctly
    this.colorPicker.setColor(hexColor);   

    id = FontList.indexOf(font);
    if (id === -1) {
      setToolActive(this.fontSection,
        this.fontSection.children[1] as HTMLElement,
        'tool-selected',
      )
    } else {
      setToolActive(this.fontSection, 
      this.fontSection.children[id+1] as HTMLElement, 'tool-selected')
    }

    this.sizeRange.setProgress(size);
  }
}
