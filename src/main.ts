import CartesianPlane from "./components/cartersianPlane/plane";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = innerWidth - 75;
canvas.height = innerHeight - 75;
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1,-1);

let plane = new CartesianPlane(canvas, ctx);