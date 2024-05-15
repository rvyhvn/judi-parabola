import Konva from "konva";

const width = window.innerWidth;
const height = window.innerHeight;

let stageScale = 1;
let stagePosition = { x: width / 2, y: height / 2 };
let groundPoints = [-width, 0, width, 0];
let groundPos = { x: 0, y: 200 };
let ballPosition = { x: -650, y: groundPos.y - 25 };
let isBallMoving = false;
let hoveredPoint = null;

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
});

const ballTrail = new Konva.Line({
    stroke: "red",
    strokeWidth: 1,
    lineCap: "round",
    lineJoin: "round",
    points: [],
});

const infoText = new Konva.Text({
    x: 0,
    y: 10,
    text: "",
    fontSize: 50,
    fontFamily: "Ubuntu",
    fill: "black",
});

layer.add(ground);
layer.add(basketBall);
layer.add(infoText);
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
    layer.batchDraw();
    prevPointerPosition = currentPointerPosition;
});

let v0 = 60;
let angleDeg = 45;
let g = 9.81; // Gravity 9.81 m/s^2
const dt = 0.1;

let t, v0x, v0y, vx, vy;

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

ballTrail.on("click", () => {
    console.log("Ball trail clicked!");
    const mousePos = stage.getPointerPosition();
    const closestPoint = this.getClosestPoint(mousePos);

    if (closestPoint) {
        hoveredPoint = closestPoint.point;
    } else {
        hoveredPoint = null;
    }
});

const velocityThreshold = 0.1; // Threshold below which the ball stops moving

function animate() {
    if (!isBallMoving) return;

    let x = basketBall.x() + vx * dt;
    let y = basketBall.y() + vy * dt - 0.5 * g * dt * dt;

    if (y >= groundPos.y - 25) {
        vy = -vy * 0.8; // Assuming 80% restitution
        vx *= 0.9; // Assuming 90% horizontal velocity retention
        y = groundPos.y - 25;
    }

    vy += g * dt;

    basketBall.position({ x, y });
    ballTrail.points(ballTrail.points().concat([x, y]));
    if (hoveredPoint) {
        const index = ballTrail.points().indexOf(hoveredPoint.x, hoveredPoint.y);
        const time = (index / 2) * dt; // Calculate approximate time based on index
        infoText.text(
            `Position: (${hoveredPoint.x.toFixed(2)}, ${hoveredPoint.y.toFixed(
                2
            )})\nVelocity: (${vx.toFixed(2)}, ${vy.toFixed(2)})\nTime: ${time.toFixed(
                2
            )} s`
        );
    } else {
        infoText.text("");
    }
    if (
        y <= groundPos.y - 25 &&
        Math.abs(vx) > velocityThreshold
    ) {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        isBallMoving = false;
        cancelAnimationFrame(animationFrameId); // Cancel the animation frame
    }

    console.log(`x: ${basketBall.x()}, y: ${basketBall.y()}, vx: ${vx}, vy: ${vy}`);
    layer.batchDraw();
}

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
