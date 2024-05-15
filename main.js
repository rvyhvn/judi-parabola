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

const ballHorLine = new Konva.Line({
	points: [-25, 0, 25, 0],
	x: basketBall.x(),
	y: basketBall.y(),
	stroke: 'black',
	strokeWidth: 1,
})

const ballVerLine = new Konva.Line({
	points: [0, -25, 0, 25],
	x: basketBall.x(),
	y: basketBall.y(),
	stroke: 'black',
	strokeWidth: 1,
})

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
layer.add(ballHorLine);
layer.add(ballVerLine);
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

const g = 9.81; // Gravity 9.81 m/s^2
const dt = 0.1;

let v0, angleDeg, t, v0x, v0y, vx, vy;
const isAboveGround = groundPos.y - 25;

basketBall.on("click", () => {
	if (!isBallMoving) {
		isBallMoving = true;
		v0 = 60;
		angleDeg = 90;
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
	const rotationAngle = Math.atan2(vy, vx)
	basketBall.rotation((rotationAngle * 180) / Math.PI);
	ballHorLine.rotation((rotationAngle * 180) / Math.PI);
	ballVerLine.rotation((rotationAngle * 180) / Math.PI);
	ballHorLine.position({x: basketBall.x(), y: basketBall.y()})
	ballVerLine.position({x: basketBall.x(), y: basketBall.y()})	

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
  const velocityThreshold = 3; // Threshold below which the ball stops moving
	if (
		y <= isAboveGround // 175
    ||
		Math.abs(vx) > velocityThreshold
	) {
		animationFrameId = requestAnimationFrame(animate);
    // line di atas ini harusnya disimpan di variabel. contoh: animationFrameId = requestAnimationFrame(animate);

	} else {
		isBallMoving = false;
		cancelAnimationFrame(animationFrameId); // Cancel the animation frame
    // animationFrameId tadi, dijadikan argument untuk bisa dicancel framenya jika animasi sudah selesai.

    // TAPI NGEBUG SMUA AJG
	}

	layer.batchDraw();
}
