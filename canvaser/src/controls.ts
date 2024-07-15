export class ControlsGroup {
  constructor(rootEl: HTMLDivElement) {
    this.rootEl = rootEl
    this.rootEl.className = 'ctrl'
  }

  public btn(label: string, onClick: () => void) {
    const btn = document.createElement('button')
    btn.innerText = label
    btn.addEventListener('click', () => onClick())
    this.rootEl.appendChild(btn)
    return this
  }


  public slider(label: string, vals: number[], onChange: (val: number) => void, onFinish?: () => void) {
    const labelEl = document.createElement('p')
    labelEl.innerText = label
    this.rootEl.appendChild(labelEl)
    
    const input = document.createElement('input')
    input.type = 'range'
    input.min = vals[0].toString()
    input.value = vals[1].toString()
    input.max = vals[2].toString()
    input.addEventListener('input', () => onChange(Number(input.value)))
    if(onFinish)
      input.addEventListener('change', () => onFinish())
      
    this.rootEl.appendChild(input)

    return this
  }

  
  public group(label: string) {
    const group = document.createElement('div')
    const title = document.createElement('h3')
    title.innerText = label
    group.appendChild(title)
    this.rootEl.appendChild(group)
    return new ControlsGroup(group)
  }

  public setVisible(visible: boolean) {
    this.rootEl.style.display = visible ? 'block' : 'none'
  }

  protected rootEl: HTMLDivElement
}

export class Controls extends ControlsGroup {
  constructor(rootEl: HTMLDivElement) {
    super(rootEl)
  }
}