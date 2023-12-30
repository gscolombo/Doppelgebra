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

    // Recalculate range based on the origin canvas position
    if (this.origin.x - this.initialOrigin.x) {
      const dx = Math.ceil(
        (this.origin.x - this.initialOrigin.x) / this.scaleFactor
      );
      this.range.x = {
        min: -this.initialRange - dx,
        max: this.initialRange - dx,
      };
    }

    if (this.origin.y - this.initialOrigin.y) {
      const dy = Math.ceil(
        (this.origin.y - this.initialOrigin.y) / this.scaleFactor
      );
      this.range.y = {
        min: -this.initialRange + dy,
        max: this.initialRange + dy,
      };
    }

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
    const gridSize = 1 / (divisions ?? 1) / this.scaleRatio;

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
    for (let y = this.range.y.min; y <= this.range.y.max; y += gridSize) {
      const yPos = this.origin.y - y * this.scaleFactor;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
      this.ctx.stroke();
    }
  }

  drawMarkers() {
    const spacing = 1 / this.scaleRatio;

    // Styling
    this.ctx.fillStyle = 'black';
    this.ctx.font = '16px Cambria Math';

    const precision = this.scaleRatio >= 1 ? this.scaleRatio - 1 : 0;

    // X-axis labels
    for (let x = this.range.x.min; x <= this.range.x.max; x += spacing) {
      const xPos = this.origin.x + x * this.scaleFactor;
      this.ctx.fillRect(xPos, this.origin.y - 5, 1, 10);
      this.ctx.fillText(x.toFixed(precision), xPos - 5, this.origin.y + 20);
    }

    // Y-axis labels
    for (let y = this.range.y.min; y <= this.range.y.max; y += spacing) {
      if (y !== 0 || y * this.scaleFactor - this.origin.y === this.origin.y) {
        const yPos = this.origin.y - y * this.scaleFactor;
        this.ctx.fillRect(this.origin.x - 5, yPos, 10, 1);
        this.ctx.fillText(y.toFixed(precision), this.origin.x - 20, yPos + 5);
      }
    }
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
    if (this.scaleFactor >= this.initialScaleFactor)
      this.scaleRatio = Math.floor(this.scaleFactor / this.initialScaleFactor);
    else {
      this.scaleRatio =
        (1 / Math.ceil(this.initialScaleFactor / this.scaleFactor)) * 2;
    }
    console.log(this.scaleRatio);

    // Set translation components proportionally to ratio factor
    const dx = center.x * (1 - delta);
    const dy = center.y * (1 - delta);

    // Translate the origin with translation vector
    this.origin.x += dx;
    this.origin.y -= dy;
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
        this.origin.x += newCenter.x - center.x;
        this.origin.y += newCenter.y - center.y;
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
