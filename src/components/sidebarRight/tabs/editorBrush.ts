import { ArrowBrush, BlurBrush, BrusherLayer, BrusherTool, EraserBrush, MarkerBrush, NeonBrush, PenBrush } from "../../canvaser/Brusher";
import { Canvaser } from "../../canvaser/Canvaser";
import { Pens } from "../../popups/mediaEditor";
import { createManyRows } from "../../row";
import { ShortColorPicker } from "../../shortColorPicker";
import { RangeSettingSelector } from "../../sidebarLeft/tabs/generalSettings";
import { createNamedSection, setToolActive } from "./mediaEditor";

export type PenColorsCSS =  '--pen-color' | '--arrow-color' | '--mark-color' | '--neon-color' | ''
export class EditorBrushTab {
  container: HTMLElement;
  canvaser: Canvaser;
  colorPicker: ShortColorPicker;
  sizeRange: RangeSettingSelector;
  toolSection: HTMLElement;
  svgns: string = 'http://www.w3.org/2000/svg';
  currChangingPen: PenColorsCSS = '--pen-color'
  savedColors = {
    '--pen-color': "#FE4438",
    '--arrow-color': "#FFD60A",
    '--mark-color': "#FF8901",
    '--neon-color': "#62E5E0",
    '': '',
  }
  curBrushTool: BrusherTool;

  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'brush', 'scrollable', 'scrollable-y')
    this.curBrushTool = new BrusherTool(this.canvaser);
    this.curBrushTool.setBrush(PenBrush)


    this.canvaser.setTool(this.curBrushTool);

    this.colorPicker = new ShortColorPicker(
      (color) => {
        this.curBrushTool.setColor(color.hex);
        this.container.style.setProperty('--range-color', color.hex);
        this.container.style.setProperty(this.currChangingPen, color.hex);
        this.savedColors[this.currChangingPen] = color.hex;
      } 
    );

    // XENA TODO deal with i18n
    // @ts-ignore
    this.toolSection = createNamedSection('Tool')
    // XENA TODO deal with i18n
    // @ts-ignore
    this.sizeRange = new RangeSettingSelector("Size",
      1,
      15,
      1,
      30,
    )
    this.sizeRange.onChange = (value) => {
      this.curBrushTool.setSize(value);
    } 
    // this.sizeRange.onChangeRelease = () => this.curBrushTool.

    const [
      pen, 
      arrow,
      mark,
      neon,
      blur, 
      eraser
    ] = createManyRows([
      {
        title: "Pen",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Pen",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(PenBrush, '--pen-color', pen.container);
        }
      },
      {
        title: "Arrow",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Arrow",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(ArrowBrush, '--arrow-color', arrow.container);
        }
      },
      {
        title: "Brush",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Brush",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(MarkerBrush, '--mark-color', mark.container);
        }
      },
      {
        title: "Neon",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Neon",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(NeonBrush, '--neon-color', neon.container);
        }
      },
      {
        title: "Blur",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Blur",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(BlurBrush, '', blur.container);
          this.container.style.setProperty('--range-color', '#ffffff')
        }
      },
      {
        title: "Eraser",
        // XENA TODO deal with i18n
        // @ts-ignore
        titleLangArgs: "Eraser",
        className: 'brush-row',
        clickable: () => {
          this.onPenSelect(EraserBrush, '', eraser.container);
          this.container.style.setProperty('--range-color', '#ffffff')
        }
      }
    ])

    pen.container.prepend( this.createPen())
    arrow.container.prepend(this.createArrow());
    mark.container.prepend(this.createMark());
    neon.container.prepend(this.createNeon());
    blur.container.prepend(this.createBlur());
    eraser.container.prepend(this.createEraser());

    this.toolSection.append(
      pen.container,
      arrow.container,
      mark.container,
      neon.container,
      blur.container,
      eraser.container,
    );

    setToolActive(this.toolSection, pen.container, 'tool-selected');
    this.colorPicker.setColor(this.colorPicker.predefinedColors[1])
    this.container.append(this.colorPicker.container, this.sizeRange.container, this.toolSection)
    
  }

  private onPenSelect(pen: typeof BrusherLayer, variable: PenColorsCSS, container: HTMLElement) {
    
    this.curBrushTool.setBrush(pen);
    setToolActive(this.toolSection, container, 'tool-selected');
    this.currChangingPen = variable
    this.colorPicker.setColor(this.savedColors[this.currChangingPen]);
  }

  public createPen() {
    const pen = document.createElementNS(this.svgns, 'svg');
    pen.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1291)">
      <g filter="url(#filter0_iiii_6189_1291)">
      <path d="M0 1H80L110.2 8.44653C112.048 8.90213 112.971 9.12994 113.185 9.49307C113.369 9.80597 113.369 10.194 113.185 10.5069C112.971 10.8701 112.048 11.0979 110.2 11.5535L80 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path class="pen" d="M112.564 10.9709L103.474 13.2132C103.21 13.2782 102.944 13.121 102.883 12.8566C102.736 12.2146 102.5 11.0296 102.5 10C102.5 8.9705 102.736 7.78549 102.883 7.14344C102.944 6.87906 103.21 6.72187 103.474 6.78685L112.564 9.02913C113.578 9.27925 113.578 10.7208 112.564 10.9709Z"/>
      <rect class="pen" x="76" y="1" width="4" height="18" rx="0.5"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1291" x="0" y="-4" width="116.323" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1291" result="effect2_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1291" result="effect3_innerShadow_6189_1291"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1291" result="effect4_innerShadow_6189_1291"/>
      </filter>
      <clipPath id="clip0_6189_1291">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>

    `
    return pen;
  }

  public createArrow() {
    const arrow = document.createElementNS(this.svgns, 'svg');
    arrow.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1354)">
      <path d="M94 10H110M110 10L104 4M110 10L104 16" stroke="url(#paint0_linear_6189_1354)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g filter="url(#filter0_iiii_6189_1354)">
      <path d="M0 1H92C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path class="arrow" d="M92 1V1C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19V19V1Z"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1354" x="0" y="-4" width="99" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1354" result="effect2_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1354" result="effect3_innerShadow_6189_1354"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1354" result="effect4_innerShadow_6189_1354"/>
      </filter>
      <linearGradient id="paint0_linear_6189_1354" x1="110" y1="10" x2="94" y2="10" gradientUnits="userSpaceOnUse">
      <stop class="arrow" offset="0.755" />
      <stop class="arrow" offset="1" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="clip0_6189_1354">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
    `
    return arrow;
  }

  public createMark() {
    const mark = document.createElementNS(this.svgns, 'svg');
    mark.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1365)">
      <g filter="url(#filter0_iiii_6189_1365)">
      <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <rect class="mark" x="76" y="1" width="4" height="18" rx="0.5" />
      <path class="mark" d="M102 5H106.434C106.785 5 107.111 5.1843 107.291 5.4855L112.091 13.4855C112.491 14.152 112.011 15 111.234 15H102V5Z"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1365" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1365" result="effect2_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1365" result="effect3_innerShadow_6189_1365"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1365" result="effect4_innerShadow_6189_1365"/>
      </filter>
      <clipPath id="clip0_6189_1365">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>

    `
    return mark;
  }

  public createNeon() {
    const neon = document.createElementNS(this.svgns, 'svg');
    neon.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1369)">
      <g filter="url(#filter0_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"/>
      </g>
      <g filter="url(#filter1_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" />
      </g>
      <g filter="url(#filter2_f_6189_1369)">
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" />
      </g>
      <g filter="url(#filter3_iiii_6189_1369)">
      <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <rect class="neon" x="76" y="1" width="4" height="18" rx="0.5"  />
      <path class="neon" d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z"  />
      </g>
      <defs>
      <filter id="filter0_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter1_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter2_f_6189_1369" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_6189_1369"/>
      </filter>
      <filter id="filter3_iiii_6189_1369" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1369" result="effect2_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1369" result="effect3_innerShadow_6189_1369"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1369" result="effect4_innerShadow_6189_1369"/>
      </filter>
      <clipPath id="clip0_6189_1369">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
      `
    return neon;
  }

  public createBlur() {
    const blur = document.createElementNS(this.svgns, 'svg');
    blur.innerHTML =
    `
      <svg width="122" height="20" viewBox="0 0 122 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_iiii_6189_1380)">
      <path d="M0 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5V1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5V1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5V18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5V18.5C78.0968 18.8064 77.7836 19 77.441 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <g filter="url(#filter1_f_6189_1380)">
      <circle cx="107.5" cy="10.5" r="4.5" fill="white"/>
      <circle cx="107.5" cy="10.5" r="4.5" fill="url(#paint0_angular_6189_1380)"/>
      <circle cx="107.5" cy="10.5" r="4.5" fill="url(#paint1_radial_6189_1380)" fill-opacity="0.35"/>
      </g>
      <g filter="url(#filter2_f_6189_1380)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white"/>
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#paint2_angular_6189_1380)"/>
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#paint3_radial_6189_1380)" fill-opacity="0.35"/>
      </g>
      <mask id="mask0_6189_1380" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="1" width="100" height="18">
      <path d="M2 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5V1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5V1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5V18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5V18.5C78.0968 18.8064 77.7836 19 77.441 19H2V1Z" fill="#3E3F3F"/>
      </mask>
      <g mask="url(#mask0_6189_1380)">
      <path d="M79 19V1H78V19H79Z" fill="black" fill-opacity="0.33"/>
      <path d="M96 19V1H95V19H96Z" fill="black" fill-opacity="0.33"/>
      </g>
      <defs>
      <filter id="filter0_iiii_6189_1380" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1380" result="effect2_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1380" result="effect3_innerShadow_6189_1380"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1380" result="effect4_innerShadow_6189_1380"/>
      </filter>
      <filter id="filter1_f_6189_1380" x="98" y="1" width="19" height="19" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_6189_1380"/>
      </filter>
      <filter id="filter2_f_6189_1380" x="95.4215" y="0" width="21.5786" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_6189_1380"/>
      </filter>
      <radialGradient id="paint0_angular_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(107.5 10.5) rotate(90) scale(4.5)">
      <stop stop-color="#00DC4B"/>
      <stop offset="0.2" stop-color="#A717FF"/>
      <stop offset="0.345" stop-color="#DF3636"/>
      <stop offset="0.485" stop-color="#FF7A00"/>
      <stop offset="0.635" stop-color="#FFB800"/>
      <stop offset="0.775" stop-color="#EBFF00"/>
      <stop offset="1" stop-color="#00FFF0"/>
      </radialGradient>
      <radialGradient id="paint1_radial_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(107.5 10.5) rotate(100.317) scale(0.914791 0.827257)">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="white"/>
      </radialGradient>
      <radialGradient id="paint2_angular_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(106.211 10) rotate(90) scale(5 5.78927)">
      <stop stop-color="#00DC4B"/>
      <stop offset="0.2" stop-color="#A717FF"/>
      <stop offset="0.345" stop-color="#DF3636"/>
      <stop offset="0.485" stop-color="#FF7A00"/>
      <stop offset="0.635" stop-color="#FFB800"/>
      <stop offset="0.775" stop-color="#EBFF00"/>
      <stop offset="1" stop-color="#00FFF0"/>
      </radialGradient>
      <radialGradient id="paint3_radial_6189_1380" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(106.211 10) rotate(101.902) scale(1.02197 1.0585)">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="white"/>
      </radialGradient>
      </defs>
      </svg>
      `
    return blur;
  }

  public createEraser() {
    const eraser = document.createElementNS(this.svgns, 'svg');
    eraser.innerHTML =
    `
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_6189_1434)">
      <g filter="url(#filter0_i_6189_1434)">
      <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#D9D9D9"/>
      <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#F09B99"/>
      </g>
      <g filter="url(#filter1_iiii_6189_1434)">
      <path d="M0 1H77.6464C77.8728 1 78.0899 0.910072 78.25 0.75V0.75C78.4101 0.589928 78.6272 0.5 78.8536 0.5H96C97.1046 0.5 98 1.39543 98 2.5V17.5C98 18.6046 97.1046 19.5 96 19.5H78.8536C78.6272 19.5 78.4101 19.4101 78.25 19.25V19.25C78.0899 19.0899 77.8728 19 77.6464 19H0V1Z" fill="#3E3F3F"/>
      </g>
      <path d="M79 19.5V0.5L78 0.5V19.5H79Z" fill="black" fill-opacity="0.33"/>
      </g>
      <defs>
      <filter id="filter0_i_6189_1434" x="95" y="-1" width="19" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="2" dy="-2"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1434"/>
      </filter>
      <filter id="filter1_iiii_6189_1434" x="0" y="-4.5" width="101" height="29" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="3" dy="-5"/>
      <feGaussianBlur stdDeviation="3"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow_6189_1434" result="effect2_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="-1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect2_innerShadow_6189_1434" result="effect3_innerShadow_6189_1434"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1" dy="1"/>
      <feGaussianBlur stdDeviation="0.5"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0"/>
      <feBlend mode="normal" in2="effect3_innerShadow_6189_1434" result="effect4_innerShadow_6189_1434"/>
      </filter>
      <clipPath id="clip0_6189_1434">
      <rect width="20" height="120" fill="white" transform="matrix(0 1 -1 0 120 0)"/>
      </clipPath>
      </defs>
      </svg>
    `
    return eraser;
  }


}
