export type MouseEv = {
  x: number;
  y: number;
  imX: number;
  imY: number;
  pressed: boolean;
  ctrl: boolean;
  shift: boolean;
  iFactor: number;
};

export type MouseMoveEv = MouseEv & {
  dx: number;
  dy: number;
};
