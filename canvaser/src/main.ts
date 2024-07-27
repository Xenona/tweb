import './style.css'
import { Canvaser } from './canvaser/Canvaser'
import { Controls, ControlsGroup } from './controls'
import { BaseTool, NoneTool } from './canvaser/Tool'
import { CropTool } from './canvaser/Crop'
import { ArrowBrush, BlurBrush, BrusherTool, EraserBrush, MarkerBrush, NeonBrush, PenBrush } from './canvaser/Brusher'
import { StickerLayer } from './canvaser/Sticker'
import { TextLayer, TextOptions } from './canvaser/Text'

const appEl = document.querySelector<HTMLDivElement>('#app')

const canvasContainer = document.createElement('div')
canvasContainer.className = 'canvas'
const canvas = document.createElement('canvas')
canvasContainer.appendChild(canvas)
appEl?.appendChild(canvasContainer)

let canvaser: Canvaser

const controlsEl = document.createElement('div')
appEl?.appendChild(controlsEl)
const controls = new Controls(controlsEl)

function setImageBase(url: string) {
  const image = new Image()
  image.addEventListener('load', () => {
    if(canvaser) 
      canvaser.detach()
    canvaser = new Canvaser(canvas, image)
    canvaser.emitUpdate()
  })
  image.src = url
}

setImageBase('/public/src1.jpg')

controls
  .group('Actions')
  .btn('Undo', () => canvaser.undo())
  .btn('Redo', () => canvaser.redo())
controls
  .group('Base load')
  .btn('load image 1', () => setImageBase('/src1.jpg'))
  .btn('load image 2', () => setImageBase('/src2.jpg'))

const ctrlModes: ControlsGroup[] = []

function setCtrlMode(mode: ControlsGroup | null, getTool: ()=>BaseTool) {
  ctrlModes.map((e) => e.setVisible(e == mode))
  canvaser.setTool(getTool())
}

const modeSelector = controls.group('Mode')
modeSelector.btn('None', () => setCtrlMode(null, () => new NoneTool(canvaser)))

function createMode(label: string, getTool: ()=>BaseTool) {
  const mode = controls.group(label)
  ctrlModes.push(mode)
  modeSelector.btn(label, () => setCtrlMode(mode, getTool))
  mode.setVisible(false)
  return mode
}

const effectFinish = () => canvaser.rootEffects.finishEdit()
createMode('Filters', () => new NoneTool(canvaser))
  .slider(
    'Contrast',
    [-100, 0, 100],
    (val) => {
      canvaser.rootEffects.contrast.setValue(val)
    },
    effectFinish
  )
  .slider(
    'Blur',
    [0, 0, 20],
    (val) => {
      canvaser.rootEffects.blur.setValue(val)
    },
    effectFinish
  )
  .slider(
    'Brightness',
    [-100, 0, 100],
    (val) => {
      canvaser.rootEffects.brightness.setValue(val)
    },
    effectFinish
  )
  .slider(
    'Grayscale',
    [0, 0, 100],
    (val) => {
      canvaser.rootEffects.grayscale.setValue(val)
    },
    effectFinish
  )

let curCropTool: CropTool;
createMode('Crop', () => {
  curCropTool = new CropTool(canvaser)
  return curCropTool
})

.slider(
  'Angle',
  [-180, 0, 180],
  (val) => {
    canvaser.crop.setAngle(val / 180 * Math.PI)
  },
  () => canvaser.crop.finishAngleEdit() 
)
.btn('Reset crop', () => {
  canvaser.crop.reset()
})
.btn('Reset aspect', () => {
  curCropTool.setForcedRatio(undefined)
})
.btn('Fix aspect 1:1', () => {
  curCropTool.setForcedRatio(1)
})
.btn('Fix aspect 4:3', () => {
  curCropTool.setForcedRatio(4/3)
})


let curBrushTool: BrusherTool;
createMode('Brush', () => {
  curBrushTool = new BrusherTool(canvaser)
  return curBrushTool
})
.slider(
  'Width',
  [2, 5, 40],
  (val) => {
    curBrushTool.setSize(val)
  }
)
.slider(
  'Color',
  [0, 0, 180],
  (val) => {
    curBrushTool.setColor(`hsl(${val}, 100%, 50%)`)
  }
)
.btn('Simple brush', () => {
  curBrushTool.setBrush(PenBrush)
})
.btn('Arrow brush', () => {
  curBrushTool.setBrush(ArrowBrush)  
})
.btn('Marker brush', () => {
  curBrushTool.setBrush(MarkerBrush)
})
.btn('Neon brush', () => {
  curBrushTool.setBrush(NeonBrush)
})
.btn('Eraser brush', () => {
  curBrushTool.setBrush(EraserBrush)
})
.btn('Blur brush', () => {
  curBrushTool.setBrush(BlurBrush)
})

function addSticker(url: string) {
  const img = new Image()
  img.addEventListener('load', () => {
    canvaser.addLayer(new StickerLayer(canvaser, img))
  })
  img.src = url
}

createMode('Stickers', () => new NoneTool(canvaser))
.btn('Sticker balloon', () => {
  addSticker('/stick1.jpg')
})
.btn('Sticker duck', () => {
  addSticker('/stick2.jpg')
})              


function setTextInfo(o: Partial<TextOptions>) {
  if(canvaser.focusedLayer instanceof TextLayer) {
    canvaser.focusedLayer.updateText(o)
  }
}

function emitTextHist() {
  if(canvaser.focusedLayer instanceof TextLayer) {
    canvaser.focusedLayer.emitHistory();
  }
}

function setTextInfoHist(o: Partial<TextOptions>) {
  if(canvaser.focusedLayer instanceof TextLayer) {
    canvaser.focusedLayer.updateText(o)
    canvaser.focusedLayer.emitHistory();
  }
}

const fonts = [
  "Source Code Pro",
  "Kanit",
  "Playwrite BE VLG",
  "Edu AU VIC WA NT Hand",
  "Roboto",
]

createMode('Text', () => new NoneTool(canvaser))
.btn('Add text', () => {
  canvaser.addLayer(new TextLayer(canvaser, 'Hello, World!\nWormey\nThis is a text!'))
})
.btn('Set text', () => {
  setTextInfoHist({ text: prompt('Enter text') ?? ' ' })
})
.slider(
  'Size',
  [10, 48, 200],
  (val) => setTextInfo({ size: val }),
  emitTextHist
)
.slider(
  'Color',
  [0, 0, 180],
  (val) => {
    setTextInfo({ color: `hsl(${val}, 100%, 50%)`})
  },
  emitTextHist
)
.slider(
  'Font',
  [0, 0, 4],
  (val) => {
    setTextInfo({ font: fonts[val] })
  },
  emitTextHist
)
.btn('Left', () => setTextInfoHist    ({ align: 'left' }))
.btn('Center', () => setTextInfoHist    ({ align: 'center' }))
.btn('Right', () => setTextInfoHist   ({ align: 'right' }))    
.btn('Normal', () => setTextInfoHist    ({ mode: 'normal' }))
.btn('Stroke', () => setTextInfoHist    ({ mode: 'stroke' }))
.btn('Shield', () => setTextInfoHist    ({ mode: 'shield' }))    
