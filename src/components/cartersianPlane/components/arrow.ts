export default class Axis {
    ctx: CanvasRenderingContext2D;
    shape: Path2D;
    markers: number[];
    origin: {x: number, y: number};

    constructor(context: CanvasRenderingContext2D, origin: {x: number, y: number}, x = true,) {
        this.ctx = context;
        this.markers = [];
        this.origin = origin;
        this.shape = this.drawShape(x);
    }
    
    drawShape(x: boolean): Path2D {
        const path = new Path2D();
        const width = this.ctx.canvas.width;
        const height = this.ctx.canvas.height;

        this.ctx.fillText('0', -7.5, -2.5, 16);
        if (x) {
            path.rect(-this.origin.x, 0, width, 1);
            path.addPath(this.drawTip(width - this.origin.x, 0));
            path.addPath(this.drawMarkers(width, 0));
        } else {
            path.rect(0, this.origin.y-height, 1, height);
            path.addPath(this.drawTip(0, this.origin.y));
            path.addPath(this.drawMarkers(0, height, false));
        }
        this.ctx.fill(path);
        return path;
    }

    drawTip(x: number, y: number): Path2D {
        const tip = new Path2D();
        tip.moveTo(x - 5, y - 5);
        tip.lineTo(x, y);
        x ? tip.lineTo(x - 5, y + 5) : tip.lineTo(x + 5, y - 5);
        tip.lineTo(x, y);
        tip.lineTo(x - 5, y - 5);
        this.ctx.stroke(tip);
        return tip;
    }

    drawMarkers(w: number, h: number, x: boolean = true): Path2D {
        const markers = new Path2D();
        this.ctx.scale(1,-1);
        if (x) {
            let n = -1
            for (let i = -w/11; i >= -(w + this.origin.x); i -= w/11) {
                markers.rect(i, -5, 1, 10);
                this.ctx.fillText(`${n--}`, i - 2.5, 15);
            }
            let m = 1;
            for (let i = w/11; i <= w - this.origin.x; i += w/11) {
                markers.rect(i, -5, 1, 10);
                this.ctx.fillText(`${m++}`, i - 2.5, 15);
            }
        } else {
            this.ctx.textAlign = 'right';
            let p = 1
            for (let i = h/11; i <= this.origin.y; i += h/11) {
                console.log(i)
                markers.rect(-5, i, 10, 1);
                this.ctx.fillText(`${p++}`, -10, -i + 2.5, 16);
            }
            let q = -1
            for (let i = -h/11; i >= -h; i -= h/11) {
                markers.rect(-5, i, 10, 1);
                this.ctx.fillText(`${q--}`, -10, -i + 2.5, 16);
            }
        }
        this.ctx.scale(1,-1);
        return markers;
    }
}