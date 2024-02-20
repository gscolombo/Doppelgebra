import Utils from '../../utils/utils';
import Coordinates from '../cartersianPlane/models/coordinates';
import Range from '../cartersianPlane/models/range';
import { last, mean, round, sortedIndexBy } from 'lodash';
import { EvalFunction, compile } from 'mathjs';

export default class FunctionPlot {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public f: EvalFunction;
  public _scaleFactor: number;
  public origin: Coordinates;
  public range: { x: Range; y: Range };
  public _rangeMod: number;
  public color: string;
  public abscissas: number[] = [];
  public coordinates: [number, number][] = [];

  constructor(
    expression: string,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    origin: Coordinates,
    range: { x: Range; y: Range },
    rangeMod: number,
    scale: number,
    color: string
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.origin = origin;
    this.range = range;
    this.rangeMod = rangeMod;
    this.scaleFactor = scale;
    this.color = color;
    this.f = compile(expression.replace('y=', ''));
  }

  get scaleFactor() {
    return this._scaleFactor;
  }

  set scaleFactor(scale: number) {
    this._scaleFactor = scale;
  }

  get rangeMod() {
    return this._rangeMod;
  }

  set rangeMod(n: number) {
    this._rangeMod = n;
  }

  plot(): void {
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    if (!this.coordinates.length) {
      this.firstPlotting();
    } else {
      this.filterCoordinates().forEach(([x, y], i) => {
        if (!i) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
    }
    this.ctx.stroke();
  }

  getCoordinate(x: number, y: number): [number, number] {
    return [
      x * this.scaleFactor + this.origin.x,
      -y * this.scaleFactor + this.origin.y,
    ];
  }

  derivativeAt(x: number, h: number): number {
    const y = this.f.evaluate({ x: x });
    const dy = this.f.evaluate({ x: x + h });
    return dy && y ? (dy - y) / h : null;
  }

  secondDerivativeAt(x: number, h: number): number {
    const dy = this.derivativeAt(x, h);
    const ddy = this.derivativeAt(x + h, h);
    return dy && ddy ? (ddy - dy) / h : null;
  }

  curvatureAt(x: number): number {
    const dy = this.derivativeAt(x, 0.00001);
    const ddy = this.secondDerivativeAt(x, 0.00001);
    return Math.abs(ddy) / (1 + dy ** 2) ** (3 / 2);
  }

  addCoordinates(min: number, max: number, start: boolean): void {
    const coordinates: [number, number][] = [];
    const abscissas: number[] = [];

    let x = min;
    while (x <= max) {
      x = round(x, 5);
      (start ? abscissas : this.abscissas).push(x);
      const y = this.f.evaluate({ x: x });
      (start ? coordinates : this.coordinates).push(this.getCoordinate(x, y));

      x += this.getStep(this.curvatureAt(x + 1 / 5000));
    }

    if (start) {
      this.abscissas = abscissas.concat(this.abscissas);
      this.coordinates = coordinates.concat(this.coordinates);
    }
  }

  updateCoordinates(): void {
    if (this.range.x.min < this.abscissas[0]) {
      this.addCoordinates(this.range.x.min, this.abscissas[0], true);
    }
    if (this.abscissas[this.abscissas.length - 1] < this.range.x.max) {
      this.addCoordinates(last(this.abscissas), this.range.x.max, false);
    }
  }

  firstPlotting(): void {
    let x = this.range.x.min;
    while (x <= this.range.x.max) {
      x = round(x, 5);
      this.abscissas.push(x);
      const y = this.f.evaluate({ x: x });
      const [xp, yp] = this.getCoordinate(x, y);
      this.coordinates.push([xp, yp]);
      if (x === this.range.x.min) this.ctx.moveTo(xp, yp);
      else this.ctx.lineTo(xp, yp);

      x += this.getStep(this.curvatureAt(x + 1 / 5000));
    }
  }

  filterCoordinates(): [number, number][] {
    return this.coordinates.slice(
      sortedIndexBy(this.abscissas, this.range.x.min),
      sortedIndexBy(this.abscissas, this.range.x.max)
    );
  }

  getStep(k: number): number {
    let step: number;
    if (k >= 10) step = 1 / 2000;
    else if (k >= 5 && k < 10) step = 1 / 1000;
    else if (k >= 1 && k < 5) step = 1 / 500;
    else if (k >= 0.5 && k < 1) step = 1 / 200;
    else if (k >= 0.1 && k < 0.5) step = 1 / 100;
    else if (k >= 0.01 && k < 0.1) step = 1 / 50;
    else if (k >= 0.001 && k < 0.01) step = 1 / 20;
    else if (k >= 0.0001 && k < 0.001) step = 1 / 10;
    else step = 1 / 5;

    return step / (this.rangeMod <= 1 ? this.rangeMod : 1);
  }
}
