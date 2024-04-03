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
	gravity = 0.5; // Set initial velocity, angle, and gravity
let dx = 0,
	dy = 0; // Velocity components
let animationId;

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

	// Set initial velocity and angle based on user input or default values
	velocity = 20; // Example initial velocity
	angle = 45; // Example initial angle in degrees

	// Convert angle to radians
	const angleRad = (angle * Math.PI) / 180;

	// Calculate velocity components
	dx = velocity * Math.cos(angleRad);
	dy = -velocity * Math.sin(angleRad);

	// Start the animation loop
	animationLoop();
});

const animationLoop = () => {
	// Update ball position based on velocity and gravity
	ballPosition.x += dx;
	ballPosition.y += dy;
	dy += gravity;

	// Check if the ball has hit the ground
	if (ballPosition.y >= groundPos.y - basketBall.radius()) {
		ballPosition.y = groundPos.y - basketBall.radius();
		dy = -dy * 0.8; // Apply a damping factor to simulate bounce
		dx *= 0.99; // Apply a friction factor to simulate deceleration
	}

	// Update the ball position on the canvas
	basketBall.position(ballPosition);

	// Request the next animation frame
	animationId = requestAnimationFrame(animationLoop);
};

// Helper function to stop the animation
const stopAnimation = () => {
	cancelAnimationFrame(animationId);
};
