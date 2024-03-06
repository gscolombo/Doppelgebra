import { EvalFunction, MathNode, derivative } from 'mathjs';
import Coordinates from '../components/cartersianPlane/models/coordinates';
import Range from '../components/cartersianPlane/models/range';
import { round } from 'lodash';

export default class Utils {
  static configureCanvas(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    dpr: number
  ): void {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    context.scale(dpr, dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }

  static setRange(
    rangeMod: number,
    origin: Coordinates,
    range: { x: Range; y: Range },
    scaleFactor: number
  ): void {
    // Recalculate range based on the origin canvas position and current range multiplier
    const ds = rangeMod < 1 ? Math.ceil(1 / rangeMod) : 1 / rangeMod;

    const leftEndpointX = Math.floor(-origin.x / ds / scaleFactor) * ds;
    const rightEndpointX =
      Math.ceil((innerWidth - origin.x) / ds / scaleFactor) * ds;
    const leftEndpointY =
      Math.floor((origin.y - innerHeight) / ds / scaleFactor) * ds;
    const rightEndpointY = Math.ceil(origin.y / ds / scaleFactor) * ds;

    range.x.min = round(leftEndpointX, 4);
    range.x.max = round(rightEndpointX, 4);
    range.y.min = round(leftEndpointY, 4);
    range.y.max = round(rightEndpointY, 4);
  }

  static setRangeMod(
    ratio: number,
    scaleRatio: number,
    rangeMod: number
  ): [number, number] {
    let magnitude;
    if (ratio !== scaleRatio) {
      if (ratio > 1.75 * rangeMod) {
        magnitude = Math.log10(rangeMod / 2);
        scaleRatio = ratio;
        rangeMod *= 2;
        if (Number.isInteger(magnitude)) {
          rangeMod += 10 ** magnitude;
          rangeMod = Number(rangeMod.toFixed(Math.abs(magnitude)));
        }
      }
      if (ratio < rangeMod / 1.75) {
        magnitude = Math.log10(rangeMod * 2);
        scaleRatio = ratio;
        rangeMod /= 2;
        if (Number.isInteger(magnitude)) {
          rangeMod = 1 / (1 / rangeMod + 10 ** -magnitude);
        }
      }
    }
    return [rangeMod, scaleRatio];
  }

  static getMarkerLabel(n: number, spacing: number, precision: number) {
    let exponential: boolean;

    // Set labels of big numbers to scientific notation
    if (spacing >= 1) {
      exponential =
        spacing.toString().length >= 6 ||
        n.toString().replace('-', '').length >= 6;
      return exponential ? n.toExponential() : n.toFixed(precision);
    }
    return n.toFixed(precision);
  }

  static curvatureAt(x: number, dy: MathNode, ddy: MathNode): number {
    return Math.abs(ddy.evaluate({x: x})) / (1 + dy.evaluate({x: x}) ** 2) ** (3 / 2);
  }
}
