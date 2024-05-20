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
  dragBoundFunc: function(pos) {
    stagePosition.x += pos.x - stage.x();
    stagePosition.y += pos.y -stage.y();
    return pos;
  }
});

const layer = new Konva.Layer();
const bgLayer = new Konva.Layer();

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

const tower = new Konva.Rect({
  x: basketBall.x() - basketBall.radius() * 2,
  y: basketBall.y() + basketBall.radius(),
  width: basketBall.radius() * 4,
  height: 0,
  fill: '#c1752e',
  strokeWidth: 2,
})

const ballTrail = new Konva.Line({
  stroke: "red",
  strokeWidth: 1,
  lineCap: "round",
  lineJoin: "round",
  points: [],
});

// Create legend
const legendGroup = new Konva.Group({
  x: width - 150,
  y: height - 100,
});

const legendBackground = new Konva.Rect({
  width: 150,
  height: 100,
  fill: 'cyan',
  opacity: 0.5,
});

const vxText = new Konva.Text({
  x: 5,
  y: 5,
  text: 'vx: 0',
  fontSize: 16,
  fill: 'black',
});

const vyText = new Konva.Text({
  x: 5,
  y: 25,
  text: 'vy: 0',
  fontSize: 16,
  fill: 'black',
});

const xText = new Konva.Text({
  x: 5,
  y: 45,
  text: 'x: 0',
  fontSize: 16,
  fill: 'black',
});

const yText = new Konva.Text({
  x: 5,
  y: 65,
  text: 'y: 0',
  fontSize: 16,
  fill: 'black',
});

function createCloud(x, y) {
  const cloudGroup = new Konva.Group({
    x: x,
    y: y * - 2,
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

function createRandomClouds(numClouds) {
  for (let i = 0; i < numClouds; i++) {
    const x = Math.random() * width - width / 2;
    const y = Math.random() * 300;
    const cloud = createCloud(x * 10, y);
    layer.add(cloud);
  }
}

let initialAngle = 45;

const arrow = new Konva.Arrow({
  x: basketBall.x(),
  y: basketBall.y(),
  points: [0, 0, 75, 0],
  pointerLength: 10,
  pointerWidth: 10,
  fill: 'black',
  stroke: 'black',
  rotation: -initialAngle,
});

layer.add(arrow);

document.getElementById('angle-slider').value = initialAngle;
document.getElementById('angle-value').textContent = initialAngle;

document.getElementById('angle-slider').addEventListener('input', (event) => {
  angleDeg = parseFloat(event.target.value);
  document.getElementById('angle-value').textContent = angleDeg;
  
  arrow.rotation(-angleDeg);
  layer.batchDraw();
});


legendGroup.add(legendBackground, vxText, vyText, xText, yText);
layer.add(legendGroup);
layer.add(ground);
bgLayer.add(sky, dirt, rock);
createRandomClouds(100);
layer.add(basketBall);
layer.add(ballHorLine);
layer.add(ballVerLine);
layer.add(tower);
stage.add(bgLayer);
stage.add(layer);

let prevPointerPosition = { x: 0, y: 0 };
let animationFrameId;

stage.on("pointermove", () => {
  prevPointerPosition = stage.getPointerPosition();
});

stage.on("dragmove", () => {
  const currentPointerPosition = stage.getPointerPosition();
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

let v0 = 50;
let angleDeg = 45;
let g = 9.81;
const dt = 0.1;

let t, v0x, v0y, vx, vy;
const isAboveGround = groundPos.y - 25; // Condition to check mostly the ball postition.

basketBall.on("dragmove", function() {
  if(this.y() > groundPos.y - this.radius()) {
    this.y(groundPos.y - this.radius());
1   } else {
    ballHorLine.position({ x: basketBall.x(), y: basketBall.y() });
    ballVerLine.position({ x: basketBall.x(), y: basketBall.y() });
    tower.height(groundPos.y - this.y() - this.radius());
    tower.y(this.y() + this.radius());
    tower.x(this.x() - this.radius() * 2);
    updateHeightSlider();
  }
  layer.batchDraw()
});

basketBall.on("click", () => {
  if (!isBallMoving) {
    isBallMoving = true;
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

// Update legend during animation
function animate() {
  if (!isBallMoving) return;

  let x = basketBall.x() + vx * dt;
  let y = basketBall.y() - vy * dt + 0.5 * g * dt * dt;

  if (y >= isAboveGround) {
    vy = -vy * 0.8; // Assuming 80% restitution
    vx *= 0.9; // Assuming 90% horizontal velocity retention
    y = isAboveGround;
  }

  vy -= g * dt;

  basketBall.position({ x, y });

  const rotationAngle = Math.atan2(vy, vx);
  basketBall.rotation((rotationAngle * 180) / Math.PI);

  // Update posisi dan rotasi garis horizontal dan vertikal sesuai rotasi bola
  ballHorLine.position({ x: basketBall.x(), y: basketBall.y() });
  ballVerLine.position({ x: basketBall.x(), y: basketBall.y() });

  // Kecepatan sudut (rad/s) dihitung dari kecepatan linear (vx, vy) dan radius bola (25)
  const angularVelocity = (Math.sqrt(vx * vx + vy * vy) / 25) * dt;
  ballHorLine.rotation(ballHorLine.rotation() + (angularVelocity * 180) / Math.PI);
  ballVerLine.rotation(ballVerLine.rotation() + (angularVelocity * 180) / Math.PI);

  ballTrail.points(ballTrail.points().concat([x, y]));

  // Update HTML legend
  document.getElementById('vx-value').textContent = vx.toFixed(2);
  document.getElementById('vy-value').textContent = vy.toFixed(2);
  document.getElementById('x-value').textContent = x.toFixed(2);
  document.getElementById('y-value').textContent = y.toFixed(2);

  const velocityThreshold = 3;
  if (y <= isAboveGround && Math.abs(vx) > velocityThreshold) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    isBallMoving = false;
    cancelAnimationFrame(animationFrameId);
  }

  layer.batchDraw();
}

const heightSlider = document.getElementById('height-slider');
const heightValDisplay = document.getElementById('height-value')

function updateHeightSlider() {
  const ballHeight = groundPos.y - basketBall.y() - basketBall.radius();
  heightSlider.value = ballHeight;
  heightValDisplay.textContent = ballHeight;
}

// Update ball's position based on slider value
heightSlider.addEventListener('input', (event) => {
  const newHeight = parseFloat(event.target.value);
  basketBall.y(groundPos.y - newHeight - basketBall.radius());
  ballHorLine.position({ x: basketBall.x(), y: basketBall.y() });
  ballVerLine.position({ x: basketBall.x(), y: basketBall.y() });
  tower.height(newHeight);
  tower.y(groundPos.y - newHeight);
  layer.batchDraw();
});

// Slider event listeners
document.getElementById('velocity-slider').addEventListener('input', (event) => {
  v0 = parseFloat(event.target.value);
  document.getElementById('velocity-value').textContent = v0;
});

document.getElementById('gravity-slider').addEventListener('input', (event) => {
  g = parseFloat(event.target.value);
  document.getElementById('gravity-value').textContent = g;
});

document.getElementById('angle-slider').addEventListener('input', (event) => {
  angleDeg = parseFloat(event.target.value);
  document.getElementById('angle-value').textContent = angleDeg;
});
