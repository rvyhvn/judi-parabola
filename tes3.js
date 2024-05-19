import Konva from "konva";

const width = window.innerWidth;
const height = window.innerHeight;

let stageScale = 1;
let stagePosition = { x: width / 2, y: height / 2 };
let groundPoints = [-width, 0, width, 0];
let groundPos = { x: 0, y: 200 };
let ballPosition = { x: -650, y: groundPos.y - 25 };
let isBallMoving = false;

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height - 50,
  x: stagePosition.x,
  y: stagePosition.y,
  scaleX: stageScale,
  scaleY: stageScale,
  draggable: true,
  dragBoundFunc: function (pos) {
    stagePosition.x += pos.x - stage.x();
    stagePosition.y += pos.y - stage.y();
    return pos;
  },
});

const layer = new Konva.Layer();

const ground = new Konva.Line({
  points: groundPoints,
  stroke: "black",
  strokeWidth: 1,
  x: 0,
  y: 200,
});

const basketBall = new Konva.Circle({
  x: ballPosition.x,
  y: ballPosition.y,
  radius: 25,
  stroke: "black",
  fill: "orange",
  draggable: true,
  dragBoundFunc: function (pos) {
    return {
      x: this.getAbsolutePosition().x,
    y: pos.y,
    };
  },
});

basketBall.on("dragmove", function() {
    console.log("basketball dragged move")
    if(this.y() > groundPos.y - this.radius()) {
        this.y(groundPos.y - this.radius())
    }
})

layer.add(ground);
layer.add(basketBall);
stage.add(layer);

let prevPointerPosition = { x: 0, y: 0 };
let animationFrameId;


stage.on("pointermove", () => {
  prevPointerPosition = stage.getPointerPosition();
});

stage.on("dragmove", () => {
  const currentPointerPosition = stage.getPointerPosition();
  const offsetX = currentPointerPosition.x - prevPointerPosition.x;
  const offsetY = currentPointerPosition.y - prevPointerPosition.y;
  stagePosition.x += offsetX;
  stagePosition.y += offsetY;

  const newMinX =
    Math.min(...groundPoints.filter((_, i) => i % 2 === 0)) - offsetX;
    const newMaxX =
    Math.max(...groundPoints.filter((_, i) => i % 2 === 0)) - offsetX;
  groundPoints = [newMinX, 0, newMaxX, 0];
  stagePosition.x = stage.x();
  stagePosition.y = stage.y();
  ground.setPoints(groundPoints);

  layer.batchDraw();
  prevPointerPosition = currentPointerPosition;
});

const g = 9.81;
const dt = 0.1;

let v0, angleDeg, t, v0x, v0y, vx, vy;
const isAboveGround = groundPos.y - 25; // Condition to check mostly the ball postition.

basketBall.on("click", () => {
  if (!isBallMoving) {
    isBallMoving = true;
    v0 = 60;
    angleDeg = 60;
    t = 0;
    const angleRad = (angleDeg * Math.PI) / 180;
    v0x = v0 * Math.cos(angleRad);
    v0y = v0 * Math.sin(angleRad);
    vx = v0x;
    vy = v0y;
    animate();
  }
});

function animate() {
  if (!isBallMoving) return;

  let x = basketBall.x() + vx * dt;
  let y = basketBall.y() + vy * dt - 0.5 * g * dt * dt;

  if (y >= isAboveGround) {
    vy = -vy * 0.8; // Assuming 80% restitution

    vx *= 0.9; // Assuming 90% horizontal velocity retention
    y = isAboveGround;
  }

  vy += g * dt;

  basketBall.position({ x, y });

  const velocityThreshold = 3;
  if (y <= isAboveGround && Math.abs(vx) > velocityThreshold) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    isBallMoving = false;
    cancelAnimationFrame(animationFrameId);
  }

  layer.batchDraw();
}
