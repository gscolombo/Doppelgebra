import Utils from '../../utils/utils';
import FunctionPlot from '../plot/plot';
import Coordinates from './models/coordinates';
import Range from './models/range';

export default class CartesianPlane {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public origin: Coordinates;
  public scaleFactor: number;
  public initialRange: number;
  public initialScaleFactor: number;
  public scaleRatio: number = 1;
  public range: { x: Range; y: Range };
  public rangeMod: number = 1;
  public plots: FunctionPlot[];

  constructor(canvasID: string, expressions: string[]) {
    this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    const dpr = window.devicePixelRatio * 1.25;

    this.initialRange = 5;

    Utils.configureCanvas(this.canvas, this.ctx, dpr);

    this.origin = {
      x: Math.floor(this.canvas.width / (2 * dpr)) - 0.5,
      y: Math.floor(this.canvas.height / (2 * dpr)) + 0.5,
    };

    this.range = {
      x: { min: -this.initialRange, max: this.initialRange },
      y: { min: -this.initialRange, max: this.initialRange },
    };

    this.scaleFactor = this.initialScaleFactor =
      this.canvas.width / (this.initialRange * 2 * dpr);

    const translatePlane = this.translatePlane.bind(this);
    this.canvas.addEventListener('mousedown', translatePlane);
    this.canvas.addEventListener('wheel', this.scalePlane.bind(this));

    this.updatePlots(expressions);

    // Initial draw
    requestAnimationFrame(this.drawPlane.bind(this));
  }

  drawPlane() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid(undefined, '#555', 1.0);
    this.drawGrid(5); // Subgrid
    this.drawAxes();
    this.drawMarkers();

    this.plots.forEach((plt) => {
      if (plt) {
        plt.scaleFactor = this.scaleFactor;
        plt.plot();
      }
    });
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
    const gridSize = 1 / (divisions ?? 1) / this.rangeMod;

    // Styling
    this.ctx.strokeStyle = color ?? '#bbb';
    this.ctx.lineWidth = width ?? 0.5;

    this.ctx.beginPath();
    // Vertical grid lines
    for (let x = this.range.x.min; x <= this.range.x.max; x += gridSize) {
      const xPos = this.origin.x + x * this.scaleFactor;
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
    }

    // Horizontal grid lines
    for (let y = this.range.y.min; y <= this.range.y.max; y += gridSize) {
      const yPos = this.origin.y - y * this.scaleFactor;
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
    }
    this.ctx.stroke();
  }

  drawMarkers() {
    let spacing =
      this.rangeMod < 1 ? Math.ceil(1 / this.rangeMod) : 1 / this.rangeMod;

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
        const text = Utils.getMarkerLabel(x, spacing, precision);
        const textWidth = this.ctx.measureText(text).width;
        const textHeight = this.ctx.measureText(text).fontBoundingBoxAscent;

        const posCorrection =
          innerHeight -
            Math.max(innerHeight, this.origin.y + 10 + textHeight) ||
          -Math.min(0, this.origin.y + 20 - textHeight);

        const renderParams = [
          text,
          xPos - textWidth / 2,
          this.origin.y + 20 + posCorrection,
        ] as const;

        this.ctx.fillRect(xPos, this.origin.y - 5, 1, 10);
        this.ctx.strokeText(...renderParams);
        this.ctx.fillText(...renderParams);
      }
    }

    // Y-axis labels
    for (let y = this.range.y.min; y <= this.range.y.max; y += spacing) {
      if (Math.abs(y) >= 10 ** -10) {
        const yPos = this.origin.y - y * this.scaleFactor;
        const text = Utils.getMarkerLabel(y, spacing, precision);
        const textWidth = this.ctx.measureText(text).width;

        const posCorrection =
          innerWidth - Math.max(innerWidth, this.origin.x) ||
          -Math.min(0, this.origin.x - textWidth - 15);

        const renderParams = [
          text,
          this.origin.x - textWidth - 10 + posCorrection,
          yPos + 5,
        ] as const;

        this.ctx.fillRect(this.origin.x - 5, yPos, 10, 1);
        this.ctx.strokeText(...renderParams);
        this.ctx.fillText(...renderParams);
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

    if ((this.rangeMod < 2000 || delta < 1) && (this.plots.every(plt => plt ? plt.renderCount < 10000 : true) || delta > 1)) {
      // Change scale accordingly to difference factor
      this.scaleFactor *= delta;

      // Calculate scale ratio from initial scale
      let ratio;
      if (this.scaleFactor >= this.initialScaleFactor) {
        ratio = Math.floor(this.scaleFactor / this.initialScaleFactor);
      } else {
        ratio = 1 / Math.floor(this.initialScaleFactor / this.scaleFactor);
      }
      [this.rangeMod, this.scaleRatio] = Utils.setRangeMod(
        ratio,
        this.scaleRatio,
        this.rangeMod
      );

      // Set translation components proportionally to ratio factor
      const dx = center.x * (1 - delta);
      const dy = center.y * (1 - delta);

      // Translate the origin with translation vector
      this.origin.x += dx;
      this.origin.y -= dy;

      // Update range interval
      Utils.setRange(this.rangeMod, this.origin, this.range, this.scaleFactor);

      // Clear abscissas and coordinates arrays to recalculate with new scale factor
      this.plots.forEach((plot) => {
        if (plot) {
          plot.rangeMod = this.rangeMod;
          plot.coordinates = plot.coordinates.map((_, i) => [
            plot.abscissas[i] * this.scaleFactor + this.origin.x,
            -plot.ordinates[i] * this.scaleFactor + this.origin.y,
          ]);
          plot.updateCoordinates();
        }
      });
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

        // Update range interval
        Utils.setRange(
          this.rangeMod,
          this.origin,
          this.range,
          this.scaleFactor
        );

        // Update coordinates array for each plot
        // (adds new coordinates according to the new range)
        this.plots.forEach((plot) => {
          if (plot) {
            plot.coordinates = plot.coordinates.map(([x, y]) => [
              x + dx,
              y + dy,
            ]);
            plot.updateCoordinates();
          }
        });

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

  updatePlots(expressions: string[]) {
    this.plots = expressions.map((expr, i) => {
      if (expr)
        return new FunctionPlot(
          expr,
          this.canvas,
          this.ctx,
          this.origin,
          this.range,
          this.rangeMod,
          this.scaleFactor,
          i ? 'blue' : 'red'
        );
    });
    window.requestAnimationFrame(this.drawPlane.bind(this));
  }
}
