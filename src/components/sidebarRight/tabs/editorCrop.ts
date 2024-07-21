import { AspectRatios, ICanvaser } from "../../popups/mediaEditor";
import { createManyRows } from "../../row";
import { createNamedSection, setToolActive } from "./mediaEditor";

export class EditorCropTab {
  
  canvaser: ICanvaser;
  container: HTMLElement
  
  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;

    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'crop', 'scrollable', 'scrollable-y')

    // XENA TODO deal with i18n
    // @ts-ignore
    let section  = createNamedSection("Aspect Ratio")

    const [
      free,
      original,
      square,
      x3x2,
      x2x3,
      x4x3,
      x3x4,
      x5x4,
      x4x5,
      x7x5,
      x5x7,
      x16x9,
      x9x16,
    ] = createManyRows([
      {
        icon: "fullscreen",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Free",
        title: "Free",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.free);
          setToolActive(section, free.container, "tool-selected");
        },
      },
      {
        icon: "dragmedia",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Original",
        title: "Original",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.original);
          setToolActive(section, original.container, "tool-selected");
        },
      },
      {
        icon: "square",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Square",
        title: "Square",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.square);
          setToolActive(section, square.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "3:2",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x2);
          setToolActive(section, x3x2.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "2:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x2x3);
          setToolActive(section, x2x3.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size4x3",
        title: "4:3",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x3);
          setToolActive(section, x4x3.container, "tool-selected");
        },
      },
      {
        icon: "size4x3",
        title: "3:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x3x4);
          setToolActive(section, x3x4.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size5x4",
        title: "5:4",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x4);
          setToolActive(section, x5x4.container, "tool-selected");
        },
      },
      {
        icon: "size5x4",
        title: "4:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x4x5);
          setToolActive(section, x4x5.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size7x6",
        title: "7:5",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x7x5);
          setToolActive(section, x7x5.container, "tool-selected");
        },
      },
      {
        icon: "size7x6",
        title: "5:7",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x5x7);
          setToolActive(section, x5x7.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size16x9",
        title: "16:9",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x16x9);
          setToolActive(section, x16x9.container, "tool-selected");
        },
      },
      {
        icon: "size16x9",
        title: "9:16",
        clickable: () => {
          this.canvaser.setAspectRatio(AspectRatios.x9x16);
          setToolActive(section, x9x16.container, "tool-selected");
        },
        className: "rotated",
      },
    ]);
 
    setToolActive(section, free.container, 'tool-selected');

    let partialsContainer = document.createElement('div');
    partialsContainer.classList.add('partials-container');

    partialsContainer.append(
      x3x2.container,
      x2x3.container,
      x4x3.container,
      x3x4.container,
      x5x4.container,
      x4x5.container,
      x7x5.container,
      x5x7.container,
      x16x9.container,
      x9x16.container,
    )

    section.append(free.container,
      original.container,
      square.container,
      partialsContainer
    )

    this.container.append(section)

  }
}
