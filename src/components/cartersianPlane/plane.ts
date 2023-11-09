import Axis from './components/arrow';

export default class CartesianPlane {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    zoomScale: number = 1;
    xaxis: Axis;
    yaxis: Axis;
    origin: {x: number, y: number};

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = context;
        this.origin = {x: context.getTransform().e, y: context.getTransform().f};
        this.xaxis = new Axis(context, this.origin);
        this.yaxis = new Axis(context, this.origin, false);

        this.canvas.addEventListener('mousedown', this.canvasTranslation.bind(this));
    }

    // updatePlane(newContext: CanvasRenderingContext2D) {
    //     this.xaxis = new Axis(newContext);
    //     this.yaxis = new Axis(newContext, false);
    // }

    canvasTranslation(e: MouseEvent) {
        const refOrigin = {x: e.offsetX - this.origin.x - 0.5, y: e.offsetY - this.origin.y - 0.5};
        const abortControl = new AbortController();

        this.canvas.addEventListener('mousemove', (e) => {
            this.translateCanvas(e, refOrigin, abortControl);
             // Translate canvas context uniformly
            const x = e.offsetX - (refOrigin.x - this.origin.x) - 0.5 ;
            const y = -(e.offsetY - (this.origin.y - refOrigin.y) - 0.5 );
            const norm = (x**2 + y**2)**0.5;
        }, {signal: abortControl.signal});
    }

    translateCanvas(e: MouseEvent, origin: {x: number, y: number}, abortControl: AbortController) {
        // Define translation vector
        const x = (e.offsetX - origin.x - this.origin.x);
        const y = -(e.offsetY - this.origin.y - origin.y);
        const norm = (x**2 + y**2)**0.5;


        // Translate canvas context with the mouse as reference point
        this.ctx.translate(x, y);
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.canvas.width*5, this.canvas.height*5);
        this.ctx.restore();
        this.origin = {x: this.ctx.getTransform().e, y: this.ctx.getTransform().f};

        // Redraw axes
        this.xaxis = new Axis(this.ctx, this.origin);
        this.yaxis = new Axis(this.ctx, this.origin, false);

        ['mouseup', 'mouseout'].forEach(type => {
            this.canvas.addEventListener(type, (e) => {
                abortControl.abort();
            }, {once: true});
        })        
    }
}