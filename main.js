import Konva from "konva";

const width = window.innerWidth;
const height = window.innerHeight;
let stageScale = 1;
let stagePosition = {
	x: width / 2,
	y: height / 2,
};
let groundPoints = [-width, 0, width, 0];
let groundPos = { x: 0, y: 200 };
let ballPosition = { x: -650, y: groundPos.y - 25 };
let velocity = 0,
	angle = 0,
	gravity = 0.5;
let vx = 0,
	vy = 0;
let animationId,
	canBounce = true;

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

layer.add(ground);
layer.add(basketBall);
stage.add(layer);

let prevPointerPosition = { x: 0, y: 0 };

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

basketBall.on("click", () => {
	console.log("Basket ball clicked!");
	canBounce = false;

	velocity = 20;
	angle = 45;

	const angleRad = (angle * Math.PI) / 180;

	vx = velocity * Math.cos(angleRad);
	vy = velocity * Math.sin(angleRad);

	animationLoop();
});

const animationLoop = () => {
	const timeStep = 1;
	ballPosition.x += vx * timeStep;
	ballPosition.y += vy - gravity * timeStep;
	vy += gravity * timeStep;

	if (ballPosition.y >= groundPos.y - basketBall.radius()) {
		ballPosition.y = groundPos.y - basketBall.radius();
		vy = -vy * 0.8;
		vx *= 0.9;
	}

	basketBall.position(ballPosition);

	animationId = requestAnimationFrame(animationLoop);
};

const stopAnimation = () => {
	cancelAnimationFrame(animationId);
};
