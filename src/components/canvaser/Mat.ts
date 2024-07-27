export class Mat3 {
  constructor(arr: number[]) {
    if(arr.length != 9) throw new Error('Invalid array length');
    this.mat = arr;
  }

  static identity(): Mat3 {
    return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  public multiply(other: Mat3): Mat3 {
    const a = this.mat;
    const b = other.mat;

    const n = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        for(let k = 0; k < 3; k++) {
          n[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
        }
      }
    }

    return new Mat3(n);
  }

  public inverse(): Mat3 {
    const [a, b, c, d, e, f, g, h, i] = this.mat;
    const x = e * i - h * f,
      y = f * g - d * i,
      z = d * h - g * e,
      det = a * x + b * y + c * z;
    if(det == 0) return Mat3.identity();
    const newMat = [
      x,
      c * h - b * i,
      b * f - c * e,
      y,
      a * i - c * g,
      d * c - a * f,
      z,
      g * b - a * h,
      a * e - d * b
    ];

    return new Mat3(newMat.map((v) => v / det));
  }

  public translate(x: number, y: number): Mat3 {
    return this.multiply(new Mat3([1, 0, x, 0, 1, y, 0, 0, 1]));
  }

  public rotate(angle: number): Mat3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return this.multiply(new Mat3([c, -s, 0, s, c, 0, 0, 0, 1]));
  }

  public scale(x: number, y: number): Mat3 {
    return this.multiply(new Mat3([x, 0, 0, 0, y, 0, 0, 0, 1]));
  }

  public toCanvas(): [number, number, number, number, number, number] {
    const [a, c, e, b, d, f, ..._] = this.mat;
    return [a, b, c, d, e, f];
  }

  public applyPoint(x: number, y: number): [number, number] {
    const [a, b, c, d, e, f, ..._] = this.mat;
    return [a * x + b * y + c, d * x + e * y + f];
  }

  public mat: number[];
}
