import IS_TOUCH_SUPPORTED from "../../../environment/touchSupport";
import Button from "../../button";
import { Canvaser } from "../../canvaser/Canvaser";
import { CropTool } from "../../canvaser/Crop";
import { createManyRows } from "../../row";
import { createNamedSection, setToolActive } from "./mediaEditor";




export class EditorCropTab {
  
  canvaser: Canvaser;
  container: HTMLElement;
  cropRuler: HTMLElement;
  curCropTool: CropTool;
  setAngleOnUpdate: (angle: number) => void;

  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
    this.curCropTool = new CropTool(canvaser);
    
    const {commonContainer, setAngle }= this.getCropRuler();
    this.cropRuler = commonContainer;
    this.setAngleOnUpdate = setAngle;
    

    
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
          this.curCropTool.setForcedRatio(undefined);
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
          this.curCropTool.setForcedRatio(this.canvaser.rootImage.width/this.canvaser.rootImage.height);
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
          this.curCropTool.setForcedRatio(1);
          setToolActive(section, square.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "3:2",
        clickable: () => {
          this.curCropTool.setForcedRatio(3/2);
          setToolActive(section, x3x2.container, "tool-selected");
        },
      },
      {
        icon: "size3x2",
        title: "2:3",
        clickable: () => {
          this.curCropTool.setForcedRatio(2/3);
          setToolActive(section, x2x3.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size4x3",
        title: "4:3",
        clickable: () => {
          this.curCropTool.setForcedRatio(4/3);
          setToolActive(section, x4x3.container, "tool-selected");
        },
      },
      {
        icon: "size4x3",
        title: "3:4",
        clickable: () => {
          this.curCropTool.setForcedRatio(3/4);
          setToolActive(section, x3x4.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size5x4",
        title: "5:4",
        clickable: () => {
          this.curCropTool.setForcedRatio(5/4);
          setToolActive(section, x5x4.container, "tool-selected");
        },
      },
      {
        icon: "size5x4",
        title: "4:5",
        clickable: () => {
          this.curCropTool.setForcedRatio(4/5)
          setToolActive(section, x4x5.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size7x6",
        title: "7:5",
        clickable: () => {
          this.curCropTool.setForcedRatio(7/5);
          setToolActive(section, x7x5.container, "tool-selected");
        },
      },
      {
        icon: "size7x6",
        title: "5:7",
        clickable: () => {
          this.curCropTool.setForcedRatio(5/7)
          setToolActive(section, x5x7.container, "tool-selected");
        },
        className: "rotated",
      },
      {
        icon: "size16x9",
        title: "16:9",
        clickable: () => {
          this.curCropTool.setForcedRatio(16/9)
          setToolActive(section, x16x9.container, "tool-selected");
        },
      },
      {
        icon: "size16x9",
        title: "9:16",
        clickable: () => {
          this.curCropTool.setForcedRatio(9/16);
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

  private getCropRuler() {

    const container = document.createElement('div');
    container.classList.add('rotation-container');
    
    const sliderWrapper = document.createElement('div');
    sliderWrapper.classList.add('slider-wrapper');
    container.appendChild(sliderWrapper);
  
    const slider = document.createElement('div');
    slider.classList.add('rotation-slider');
    sliderWrapper.appendChild(slider);
  
    const handle = document.createElement('div');
    handle.classList.add('rotation-handle');
    container.appendChild(handle);

    const labels: {angle: number, position: number, label: HTMLElement}[] = [];
  
    for (let i = -180; i <= 180; i += 2.5) {
      const dot = document.createElement('div');
      dot.classList.add('rotation-dot');
      dot.style.left = `${((i + 180) / 360) * 100}%`; 
      if (Math.abs(i) % 15 === 0) {
        dot.style.backgroundColor = '#FFFFFF';
        dot.style.height = '2px';
        dot.style.width = '2px';
      }
      slider.appendChild(dot);
  
      if (i % 15 === 0) {
        const label = document.createElement('div');
        label.classList.add('rotation-label');
        label.id = `rotation-label-${i}deg`
        label.style.left = `${((i + 180) / 360) * 100}%`;
        label.innerText = `${i}°`;
        slider.appendChild(label);

        labels.push({
          angle: i,
          position: (i + 180) / 360,
          label,
        });
      }
    }

    let events = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    if (IS_TOUCH_SUPPORTED) {
      events = ['touchstart', 'touchmove', 'touchend', 'touchcancel']
    }
    
    let isDragging = false;
    let startX = 0;
    let prev = 0;
  
    const startDrag = (e: Event) => {
      isDragging = true;

      if (e instanceof MouseEvent) {
        startX = e.clientX  
      } else if (e instanceof TouchEvent) {
        let touch = e.touches[0] || e.changedTouches[0];
        startX = touch.pageX;
      }
    }

    const moveDrag = (e: Event) => {
      if (isDragging) {
        const rect = sliderWrapper.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();

        let x: number;
        if (e instanceof MouseEvent) {
          x = e.clientX  - startX;
          startX = e.clientX  
        } else if (e instanceof TouchEvent) {
          let touch = e.touches[0] || e.changedTouches[0];
          x = touch.pageX;
        }
  
        if (!(sliderRect.left+(x) > rect.left+sliderRect.width/2) && !(sliderRect.left+(x)+2 < rect.left - sliderRect.width/2))  {
          slider.style.transform = `translateX(${prev + x}px)`;
          prev = prev + x;
          const angle = -(((prev / rect.width) * 360));
  
          this.canvaser.crop.setAngle(angle / 180 * Math.PI);
        }
      }
    }

    const endDrag = () => {
      if (isDragging) {
        const rect = sliderWrapper.getBoundingClientRect();
  
        let closestLabel: {angle: number, position: number, label: HTMLElement} = null;
        let minDistance = Infinity;
        labels.forEach(label => {
          const labelX =  - (label.position * rect.width - rect.width / 2);
          const distance = Math.abs(prev - labelX);
          if (distance < minDistance) {
            closestLabel = label;
            minDistance = distance;
          }
        });
        
        if (closestLabel && minDistance < 10) {
          const snappedX = -(closestLabel.position * rect.width - rect.width / 2);
          slider.style.transform = `translateX(${snappedX}px)`;
          labels.forEach(({label}) => label.classList.remove('active'));
          closestLabel.label.classList.add('active');
          
          this.canvaser.crop.setAngle(closestLabel.angle / 180 * Math.PI);
        }
        
        this.canvaser.crop.finishAngleEdit();
        isDragging = false;
      }
    }

    const leaveDrag = () => {
      if (isDragging) {
        isDragging = false;
      }
    }

    sliderWrapper.addEventListener(events[0], startDrag);
    sliderWrapper.addEventListener(events[1], moveDrag);
    sliderWrapper.addEventListener(events[2], endDrag);
    sliderWrapper.addEventListener(events[3], leaveDrag);

    const commonContainer = document.createElement('div');
    commonContainer.classList.add('crop-ruler')
    const rotate = Button('btn-icon rotateBtn', {
      icon: 'rotate',
    })
    
    rotate.onclick = () => {
      let numOfPies = Math.round((this.canvaser.crop.getAngle()-Math.PI/2)/(Math.PI/2));
      let nextAngle = (numOfPies*(Math.PI/2));
      if (nextAngle < -Math.PI) nextAngle+=2*Math.PI;

      let croppedAngle = ((nextAngle)%(2*Math.PI));
      const value = croppedAngle;
      this.canvaser.crop.setAngle(value);
      this.onUpdate(this.canvaser)
    };
    const flip = Button('btn-icon flipBtn', {
      icon: 'flip_editor',
    })

    // XENA TODO flip
    // flip.onclick = this.canvaser.flip.bind(this.canvaser);

    commonContainer.append(rotate, container, flip);

    function setAngle(angle: number) {
      const rect = sliderWrapper.getBoundingClientRect();
      isDragging = true;
      prev = -(((angle)*rect.width)/360);
      slider.style.transform = `translateX(${prev}px)`;
      endDrag(); 
      isDragging = false;
    }

    return {commonContainer, setAngle};
  }
 

  public onUpdate(canvaser: Canvaser) {
    this.setAngleOnUpdate(canvaser.crop.getAngle()*180/Math.PI)
  }
  
}
