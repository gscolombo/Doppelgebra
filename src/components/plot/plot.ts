import Coordinates from '../cartersianPlane/models/coordinates';
import Range from '../cartersianPlane/models/range';
import { inRange, last, round, sortedIndexBy } from 'lodash';
import { EvalFunction, MathNode, abs, compile, derivative, isComplex, parse } from 'mathjs';

export default class FunctionPlot {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public _scaleFactor: number;
  public _origin: Coordinates;
  public _rangeMod: number;
  public range: { x: Range; y: Range };
  public abscissas: number[] = [];
  public ordinates: number[] = [];
  public coordinates: [number, number][] = [];
  public color: string;

  private f: EvalFunction;
  private dy: MathNode;
  private onlyPositive = false;

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

    const expr = expression.replace('y=', '');
    this.f = compile(expr);
    this.dy = derivative(parse(expr), 'x');
  }

  get origin() {
    return this._origin;
  }

  set origin(o: Coordinates) {
    this._origin = o;
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
      this.plotOverRange();
    }
    this.ctx.stroke();
  }

  getCoordinate(x: number, y: number): [number, number] {
    return [
      round(x * this.scaleFactor + this.origin.x, 4),
      round(-y * this.scaleFactor + this.origin.y, 4),
    ];
  }

  updateCoordinates(): void {
    let min: number, max: number, rtl: boolean;
    if (this.range.x.min < this.abscissas[0]) {
      min = this.range.x.min;
      max = this.abscissas[0];
      rtl = true;
    } else if (last(this.abscissas) < this.range.x.max) {
      min = last(this.abscissas);
      max = this.range.x.max;
      rtl = false;
    }
    if (min !== undefined && max !== undefined)
      this.calculateSegments(min, max, rtl, false);
  }

  // TODO: improve plot resolution while keeping performance
  firstPlotting(): void {
    let x = this.range.x.min, y = this.f.evaluate({x: x});
    if (isComplex(y)) x = this.range.x.min = 0, y = this.f.evaluate({x: x});

    this.ctx.moveTo(...this.updateArrays(x, y));
    this.calculateSegments(x, this.range.x.max, false, true);
  }

  plotOverRange(): void {
    const start = sortedIndexBy(this.abscissas, this.range.x.min);
    const end = sortedIndexBy(this.abscissas, this.range.x.max);

    let x: number, y: number, xp: number, yp: number, wasOutOfRange: boolean;
    let f = this.rangeMod <= 1 ? 1 / this.rangeMod : 1;
    for (let i = start; i < end; i++) {
      x = this.abscissas[i]; 
      y = this.ordinates[i];
      [xp, yp] = this.coordinates[i];

      if (!inRange(y, this.range.y.min - f, this.range.y.max + f) && isFinite(y)) {
        wasOutOfRange = true;
        continue;
      };

      if (!isFinite(y)) {
        yp = this.getCoordinate(x, this.range.y[y < 0 ? 'min' : 'max'])[1];
        this.ctx.moveTo(xp, yp);
        this.ctx.lineTo(...this.coordinates[i + 1]);
        continue;
      };
      
      if (i === start || wasOutOfRange) this.ctx.moveTo(xp, yp);
      else this.ctx.lineTo(xp, yp);
      wasOutOfRange = !inRange(y, this.range.y.min - f, this.range.y.max + f);
    }
  }

  updateArrays(x: number, y: number, ltr = false): [number, number] {
    let [xp, yp] = this.getCoordinate(x, y);
    if (ltr) {
      this.abscissas.unshift(x);
      this.ordinates.unshift(y);
      this.coordinates.unshift([xp, yp]);
    } else {
      this.abscissas.push(x);
      this.ordinates.push(y);
      this.coordinates.push([xp, yp]);
    }
    return [xp, yp];
  }

  calculateSegments(min: number, max: number, rtl: boolean, draw: boolean) {
    let error = (y: number, L: number) => abs(y - L);
    let tgline = (x: number, a: number) => (this.f.evaluate({x: a}) + (this.dy.evaluate({x: a}))*(x - a)) || 0;

    const increment = 1 / 1000 * (this.rangeMod <= 1 ? 1 / this.rangeMod : 1);
    let xp: number, yp: number, a: number, y: number, x = rtl ? max : min, wasOutOfRange: boolean;
    a = x;
    while ((rtl ? x >= min : x <= max) && (x !== undefined && a !== undefined)) {
      x += increment * (rtl ? -1 : 1);
      x = round(x, 4);
      y = this.f.evaluate({x: x});
      if (error(y, tgline(x, a)) > 0.001 || !isFinite(y)) {
        [xp, yp] = this.updateArrays(x, y, rtl);
        if (draw && inRange(y, this.range.y.min, this.range.y.max + 1 / this.rangeMod)) {
          if (wasOutOfRange) this.ctx.moveTo(xp, yp);
          else this.ctx.lineTo(xp, yp);
        }
        a = x;
        wasOutOfRange = !inRange(y, this.range.y.min, this.range.y.max + 1 / this.rangeMod);
      }
    }
    if (round(y, 3) === round(tgline(x, a), 3)) {
      x = rtl ? min : max;
      y = this.f.evaluate({x: x});
      this.ctx.lineTo(...this.updateArrays(x, y, rtl));
    }
  }
}
