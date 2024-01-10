import Coordinates from './models/coordinates';
import Range from './models/range';

export default class CartesianPlane {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private origin: Coordinates;
  private scaleFactor: number;
  private initialRange: number;
  private initialScaleFactor: number;
  private scaleRatio: number = 1;
  private range: { x: Range; y: Range };
  private rangeMultiplier: number = 1;

  constructor(canvasID: string) {
    this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');

    const dpr = window.devicePixelRatio * 1;

    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = innerWidth + 'px';
    this.canvas.style.height = innerHeight + 'px';

    this.origin = {
      x: this.canvas.width / (2 * dpr),
      y: this.canvas.height / (2 * dpr),
    };

    this.initialRange = 5;
    this.range = {
      x: { min: -this.initialRange, max: this.initialRange },
      y: { min: -this.initialRange, max: this.initialRange },
    };

    this.scaleFactor = this.initialScaleFactor =
      this.canvas.width / (this.initialRange * 2 * dpr);

    this.canvas.addEventListener('mousedown', this.translatePlane.bind(this));
    this.canvas.addEventListener('wheel', this.scalePlane.bind(this));

    // Initial draw
    requestAnimationFrame(this.drawPlane.bind(this));
  }

  drawPlane() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid(undefined, '#555', 1.0);
    this.drawGrid(5); // Subgrid
    this.drawAxes();
    this.drawMarkers();
  }

  drawAxes() {
    // Origin marker
    this.ctx.fillStyle = 'rgba(0,0,0,1)';
    this.ctx.font = '16px Cambria Math';
    this.ctx.fillText('0', this.origin.x - 15, this.origin.y + 15);

    this.ctx.strokeStyle = 'rgba(0,0,0,1)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.origin.y);
    this.ctx.lineTo(this.canvas.width, this.origin.y);
    this.ctx.moveTo(this.origin.x, 0);
    this.ctx.lineTo(this.origin.x, this.canvas.height);
    this.ctx.stroke();
  }

  drawGrid(divisions?: number, color?: string, width?: number) {
    const gridSize = 1 / (divisions ?? 1) / this.rangeMultiplier;

    // Styling
    this.ctx.strokeStyle = color ?? '#bbb';
    this.ctx.lineWidth = width ?? 0.5;

    // Vertical grid lines
    for (let x = this.range.x.min; x <= this.range.x.max; x += gridSize) {
      const xPos = this.origin.x + x * this.scaleFactor;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = this.range.y.max; y >= this.range.y.min; y -= gridSize) {
      const yPos = this.origin.y + y * this.scaleFactor;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
      this.ctx.stroke();
    }
  }

  getMarkerLabel(n: number, spacing: number, precision: number) {
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

  drawMarkers() {
    let spacing =
      this.rangeMultiplier < 1
        ? Math.ceil(1 / this.rangeMultiplier)
        : 1 / this.rangeMultiplier;

    // Styling
    this.ctx.lineWidth = 3;
    this.ctx.font = '16px Cambria Math';
    this.ctx.fillStyle = 'rgba(0,0,0,1)';
    this.ctx.strokeStyle = 'rgba(255,255,255,1)';

    const digits = spacing.toString();
    const precision =
      digits.split('.')[1]?.length ??
      (spacing < 1 ? Math.floor(-Math.log10(spacing)) : 0);

    // X-axis labels
    for (let x = this.range.x.min; x <= this.range.x.max; x += spacing) {
      if (Math.abs(x) >= 10 ** -10) {
        const xPos = this.origin.x + x * this.scaleFactor;
        const text = this.getMarkerLabel(x, spacing, precision);
        const textWidth = this.ctx.measureText(text).width;
        const renderParams = [
          text,
          xPos - textWidth / 2,
          this.origin.y + 20,
        ] as const;

        this.ctx.fillRect(xPos, this.origin.y - 5, 1, 10);
        this.ctx.strokeText(...renderParams);
        this.ctx.fillText(...renderParams);
      }
    }

    // Y-axis labels
    for (let y = this.range.y.max; y >= this.range.y.min; y -= spacing) {
      if (Math.abs(y) >= 10 ** -10) {
        const yPos = this.origin.y + y * this.scaleFactor;
        const text = this.getMarkerLabel(-y, spacing, precision);
        const textWidth = this.ctx.measureText(text).width;

        const renderParams = [
          text,
          this.origin.x - textWidth - 10,
          yPos + 5,
        ] as const;

        this.ctx.fillRect(this.origin.x - 5, yPos, 10, 1);
        this.ctx.strokeText(...renderParams);
        this.ctx.fillText(...renderParams);
      }
    }
  }

  setRangeMultiplier(ratio: number) {
    let magnitude;
    if (ratio !== this.scaleRatio) {
      if (ratio > 1.75 * this.rangeMultiplier) {
        magnitude = Math.log10(this.rangeMultiplier / 2);
        this.scaleRatio = ratio;
        this.rangeMultiplier *= 2;
        if (Number.isInteger(magnitude)) {
          this.rangeMultiplier += 10 ** magnitude;
          this.rangeMultiplier = Number(
            this.rangeMultiplier.toFixed(Math.abs(magnitude))
          );
        }
      }
      if (ratio < this.rangeMultiplier / 1.75) {
        magnitude = Math.log10(this.rangeMultiplier * 2);
        this.scaleRatio = ratio;
        this.rangeMultiplier /= 2;
        if (Number.isInteger(magnitude)) {
          this.rangeMultiplier =
            1 / (1 / this.rangeMultiplier + 10 ** -magnitude);
        }
      }
    }
  }

  setRange() {
    // Recalculate range based on the origin canvas position and current range multiplier
    const ds =
      this.rangeMultiplier < 1
        ? Math.ceil(1 / this.rangeMultiplier)
        : 1 / this.rangeMultiplier;

    const leftEndpointX =
      Math.floor(-this.origin.x / ds / this.scaleFactor) * ds;
    const rightEndpointX =
      Math.ceil((this.canvas.width - this.origin.x) / ds / this.scaleFactor) *
      ds;
    const leftEndpointY =
      Math.floor(-this.origin.y / ds / this.scaleFactor) * ds;
    const rightEndpointY =
      Math.ceil((this.canvas.height - this.origin.y) / ds / this.scaleFactor) *
      ds;

    this.range.x.min = leftEndpointX;
    this.range.x.max = rightEndpointX;
    this.range.y.min = leftEndpointY;
    this.range.y.max = rightEndpointY;
  }

  scalePlane(e: WheelEvent) {
    e.preventDefault();
    // Get cursor position
    const center = {
      x: e.offsetX - this.origin.x,
      y: -(e.offsetY - this.origin.y),
    };

    // Set ratio factor from  wheel movement direction
    const delta = e.deltaY > 0 ? 0.95 : 1.05;

    if (this.rangeMultiplier < 2000 || delta < 1) {
      // Change scale accordingly to difference factor
      this.scaleFactor *= delta;

      // Calculate scale ratio from initial scale
      let ratio;
      if (this.scaleFactor >= this.initialScaleFactor) {
        ratio = Math.floor(this.scaleFactor / this.initialScaleFactor);
      } else {
        ratio = 1 / Math.floor(this.initialScaleFactor / this.scaleFactor);
      }
      this.setRangeMultiplier(ratio);

      // Set translation components proportionally to ratio factor
      const dx = center.x * (1 - delta);
      const dy = center.y * (1 - delta);

      // Translate the origin with translation vector
      this.origin.x += dx;
      this.origin.y -= dy;

      this.setRange();
    }
    requestAnimationFrame(this.drawPlane.bind(this));
  }

  translatePlane(e: MouseEvent) {
    e.preventDefault();
    // Get cursor initial position vector
    const center = {
      x: e.offsetX - this.origin.x,
      y: e.offsetY - this.origin.y,
    };
    const signalController = new AbortController();

    this.canvas.addEventListener(
      'mousemove',
      (e) => {
        // Get cursor position vector after movement
        const newCenter = {
          x: e.offsetX - this.origin.x,
          y: e.offsetY - this.origin.y,
        };

        // Translate the plane in the direction of the difference vector
        const dx = newCenter.x - center.x;
        const dy = newCenter.y - center.y;
        this.origin.x += dx;
        this.origin.y += dy;
        this.setRange();
        requestAnimationFrame(this.drawPlane.bind(this));

        // Stop movement and remove event listener when mouse is out the canvas or up
        ['mouseup', 'mouseout'].forEach((event) => {
          this.canvas.addEventListener(
            event,
            () => {
              signalController.abort();
            },
            { once: true }
          );
        });
      },
      { signal: signalController.signal }
    );
  }
}
