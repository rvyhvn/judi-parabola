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
  dragBoundFunc: function(pos) {
    stagePosition.x += pos.x - stage.x();
    stagePosition.y += pos.y -stage.y();
    return pos;
  }
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
  fill: "green",
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
  fill: "orange",
  draggable: true,
  dragBoundFunc: function (pos) {
    return {
      x: this.getAbsolutePosition().x,
      y: pos.y,
    };
  },
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

// Fungsi untuk membuat awan
function createCloud(x, y) {
  const cloudGroup = new Konva.Group({
    x: x,
    y: y * -2,
  });

  const ellipses = [
    { x: 0, y: 0, radiusX: 50, radiusY: 30 },
    { x: 50, y: -20, radiusX: 60, radiusY: 40 },
    { x: 100, y: 0, radiusX: 50, radiusY: 30 },
    { x: 50, y: 20, radiusX: 70, radiusY: 50 },
  ];

  ellipses.forEach((ellipse) => {
    const cloudPart = new Konva.Ellipse({
      x: ellipse.x,
      y: ellipse.y,
      radiusX: ellipse.radiusX,
      radiusY: ellipse.radiusY,
      fill: "white",
      stroke: "white",
    });
    cloudGroup.add(cloudPart);
  });

  return cloudGroup;
}

// Fungsi untuk membuat banyak awan dengan posisi acak
function createRandomClouds(numClouds) {
  for (let i = 0; i < numClouds; i++) {
    const x = Math.random() * width - width / 2;
    const y = Math.random() * 300; // Sesuaikan batasan Y untuk menempatkan awan di bagian atas
    const cloud = createCloud(x * 10, y);
    layer.add(cloud);
  }
}

layer.add(ground);
bgLayer.add(sky, dirt, rock);
createRandomClouds(100);
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
  // console.log(currentPointerPosition);
  // const offsetX = stage.x() - stagePosition.x;
  console.log(ground.y())
  const offsetX = currentPointerPosition.x - prevPointerPosition.x;
  const offsetY = currentPointerPosition.y - prevPointerPosition.y;
  stagePosition.x += offsetX;
  stagePosition.y += offsetY;
  
  const newMinX = Math.min(...groundPoints.filter((_, i) => i % 2 === 0) ) - offsetX; 
  const newMaxX =Math.max(...groundPoints.filter((_, i) => i % 2 === 0)) - offsetX;
  groundPoints = [newMinX, 0, newMaxX, 0];
  stagePosition.x = stage.x();
  stagePosition.y = stage.y();
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

basketBall.on("dragmove", function() {
  if(this.y() > groundPos.y - this.radius()) {
    this.y(groundPos.y - this.radius());
  }
  ballHorLine.position({ x: basketBall.x(), y: basketBall.y() });
  ballVerLine.position({ x: basketBall.x(), y: basketBall.y() });
});

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

// Slider event listeners
document
  .getElementById("velocity-slider")
  .addEventListener("input", (event) => {
    v0 = parseFloat(event.target.value);
    document.getElementById("velocity-value").textContent = v0;
  });

document.getElementById("gravity-slider").addEventListener("input", (event) => {
  g = parseFloat(event.target.value);
  document.getElementById("gravity-value").textContent = g;
});

document.getElementById("angle-slider").addEventListener("input", (event) => {
  angleDeg = parseFloat(event.target.value);
  document.getElementById("angle-value").textContent = angleDeg;
});
