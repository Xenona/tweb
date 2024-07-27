import type {Canvaser} from './Canvaser';

export class HistoryValueHelper<T> {
  constructor(canvaser: Canvaser, getVal: () => T, setVal: (val: T) => void) {
    this.canvaser = canvaser;
    this.getVal = getVal;
    this.setVal = setVal;
    this.lastState = JSON.stringify(this.getVal());
  }

  public emitHistory() {
    const prevState = this.lastState
    const newState = JSON.stringify(this.getVal());
    if(prevState === newState) {
      return;
    }

    this.canvaser.emitHistory({
      undo: () => {
        this.setVal(JSON.parse(prevState))
        this.lastState = prevState;
      },
      redo: () => {
        this.setVal(JSON.parse(newState))
        this.lastState = newState;
      }
    });

    this.lastState = newState;
  }

  private lastState: string
  private canvaser: Canvaser
  private getVal: () => T;
  private setVal: (val: T) => void;
}
