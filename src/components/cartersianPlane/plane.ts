import Coordinates from './models/coordinates';
import Range from './models/range';

export default class CartesianPlane {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private origin: Coordinates;
  private initialOrigin: Coordinates;
  private scaleFactor: number;
  private initialRange: number;
  private initialScaleFactor: number;
  private scaleRatio: number = 1;
  private range: { x: Range; y: Range };
  private rangeMultiplier: number = 1;

  constructor(canvasID: string) {
    this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.origin = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };
    this.initialOrigin = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };

    this.initialRange = 5;
    this.range = {
      x: { min: -this.initialRange, max: this.initialRange },
      y: { min: -this.initialRange, max: this.initialRange },
    };

    this.scaleFactor = this.initialScaleFactor =
      this.canvas.width / (this.initialRange * 2);

    this.canvas.addEventListener('mousedown', this.translatePlane.bind(this));
    this.canvas.addEventListener('wheel', this.scalePlane.bind(this));

    // Initial draw
    this.drawPlane();
  }

  drawPlane() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawAxes();
    this.drawGrid(null, '#555', 1.0);
    this.drawGrid(5); // Subgrid
    this.drawMarkers();
  }

  drawAxes() {
    // Origin marker
    this.ctx.fillStyle = 'black';
    this.ctx.font = '16px Cambria Math';
    this.ctx.fillText('0', this.origin.x - 15, this.origin.y + 15);

    this.ctx.strokeStyle = 'black';
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

  drawMarkers() {
    const spacing =
      this.rangeMultiplier < 1
        ? Math.ceil(1 / this.rangeMultiplier)
        : 1 / this.rangeMultiplier;

    // Styling
    this.ctx.fillStyle = 'black';
    this.ctx.font = '16px Cambria Math';

    const precision = spacing.toString().split('.')[1]?.length ?? 0;

    // X-axis labels
    for (let x = this.range.x.min; x <= this.range.x.max; x += spacing) {
      if (Math.abs(x) >= 10 ** -10) {
        const xPos = this.origin.x + x * this.scaleFactor;
        this.ctx.fillRect(xPos, this.origin.y - 5, 1, 10);
        this.ctx.fillText(x.toFixed(precision), xPos - 5, this.origin.y + 20);
      }
    }

    // Y-axis labels
    for (let y = this.range.y.max; y >= this.range.y.min; y -= spacing) {
      if (Math.abs(y) >= 10 ** -10) {
        const yPos = this.origin.y + y * this.scaleFactor;
        this.ctx.fillRect(this.origin.x - 5, yPos, 10, 1);
        this.ctx.fillText(
          (-y).toFixed(precision),
          this.origin.x - 20,
          yPos + 5
        );
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
    this.drawPlane();
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
        this.drawPlane();

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
