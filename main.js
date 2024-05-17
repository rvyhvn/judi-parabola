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
  height: height,
  x: stagePosition.x,
  y: stagePosition.y,
  scaleX: stageScale,
  scaleY: stageScale,
  draggable: true,
});

const layer = new Konva.Layer();
const bgLayer = new Konva.Layer(); // Layer for the color of the backgrounds (i.e. sky, dirt and rock).

const ground = new Konva.Line({
  points: groundPoints,
  stroke: "black",
  strokeWidth: 1,
  x: 0,
  y: 200,
});

const dirt = new Konva.Rect({
  x: ground.x() - width,
  y: ground.y() + 50,
  width: width + width,
  height: height,
  fill: "brown",
});

const rock = new Konva.Rect({
  x: dirt.x(),
  y: ground.y(),
  width: width + width,
  height: 50,
  fill: "grey",
});

const sky = new Konva.Rect({
  x: dirt.x(),
  y: -height,
  width: width + width,
  height: height + height,
  fill: "lightblue",
});

const basketBall = new Konva.Circle({
  x: ballPosition.x,
  y: ballPosition.y,
  radius: 25,
  stroke: "black",
});

const ballHorLine = new Konva.Line({
  points: [-25, 0, 25, 0],
  x: basketBall.x(),
  y: basketBall.y(),
  stroke: "black",
  strokeWidth: 1,
});

const ballVerLine = new Konva.Line({
  points: [0, -25, 0, 25],
  x: basketBall.x(),
  y: basketBall.y(),
  stroke: "black",
  strokeWidth: 1,
});

const ballTrail = new Konva.Line({
  stroke: "red",
  strokeWidth: 1,
  lineCap: "round",
  lineJoin: "round",
  points: [],
});

layer.add(ground);
bgLayer.add(sky, dirt, rock);
layer.add(basketBall);
layer.add(ballHorLine);
layer.add(ballVerLine);
stage.add(bgLayer);
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
  const minX = Math.min(...groundPoints.filter((_, i) => i % 2 === 0));
  const maxX = Math.max(...groundPoints.filter((_, i) => i % 2 === 0));
  const newMinX = minX - offsetX;
  const newMaxX = maxX - offsetX;
  groundPoints = [newMinX, 0, newMaxX, 0];
  stage.setPosition(stagePosition);
  ground.setPoints(groundPoints);

  const skyWidth = width + width + Math.abs(newMinX) + Math.abs(newMaxX);
  const skyHeight = height + height;
  sky.width(skyWidth);
  sky.height(skyHeight);
  sky.x(newMinX - width);

  const dirtWidth = skyWidth;
  const dirtHeight = height;
  dirt.width(dirtWidth);
  dirt.height(dirtHeight);
  dirt.x(newMinX - width);
  dirt.y(ground.y() + 50);

  const rockWidth = dirtWidth;
  const rockHeight = 50;
  rock.width(rockWidth);
  rock.height(rockHeight);
  rock.x(newMinX - width);
  rock.y(ground.y());

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

layer.add(ballTrail);

function animate() {
  if (!isBallMoving) return;

  let x = basketBall.x() + vx * dt;
  let y = basketBall.y() + vy * dt - 0.5 * g * dt * dt;

  console.log(vx);

  if (y >= isAboveGround) {
    vy = -vy * 0.8; // Assuming 80% restitution

    vx *= 0.9; // Assuming 90% horizontal velocity retention
    y = isAboveGround;
  }

  vy += g * dt;

  basketBall.position({ x, y });
  const rotationAngle = Math.atan2(vy, vx);
  basketBall.rotation((rotationAngle * 180) / Math.PI);
  ballHorLine.rotation((rotationAngle * 180) / Math.PI);
  ballVerLine.rotation((rotationAngle * 180) / Math.PI);
  ballHorLine.position({ x: basketBall.x(), y: basketBall.y() });
  ballVerLine.position({ x: basketBall.x(), y: basketBall.y() });

  ballTrail.points(ballTrail.points().concat([x, y]));

  const velocityThreshold = 3; 
  if (y <= isAboveGround && Math.abs(vx) > velocityThreshold) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    isBallMoving = false;
    cancelAnimationFrame(animationFrameId);
  }

  layer.batchDraw();
}
