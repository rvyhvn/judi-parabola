import "./style.css";
import Konva from "konva";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let stagePos = { x: WIDTH / 2, y: HEIGHT / 2 };
let groundLinePos = { x: 0, y: 0 };
let prevPointerPos = { x: 0, y: 0 };

const addObjectsOnLayer = (objectsLayer) => {
	const ball = new Konva.Circle({
		draggable: true,
		x: -200,
		y: groundLinePos.y - 25,
		radius: 25,
		stroke: "black",
		strokeWidth: 1,
	});
	objectsLayer.add(ball);
};

const addGridsOnLayer = (gridLayer, stage) => {
	const groundLine = new Konva.Line({
		points: [-WIDTH, 0, WIDTH, 0],
		x: groundLinePos.x,
		y: groundLinePos.y,
		stroke: "black",
		strokeWidth: 1,
	});
	gridLayer.add(groundLine);
	gridLayer.on("pointermove", () => {
		prevPointerPos = stage.getPointerPosition();
	});

	gridLayer.on("dragmove", (e) => {
		const currentPointerPosition = stage.getPointerPosition();
		const offsetX = currentPointerPosition.x - prevPointerPos.x;
		const offsetY = currentPointerPosition.y - prevPointerPos.y;

		gridLayer.children.each((child) => {
			const points = child.points();
			child.points([
				points[0] - offsetX,
				points[1] - offsetY,
				points[2] - offsetX,
				points[3] - offsetY,
			]);
		});

		prevPointerPos = currentPointerPosition;
	});

	gridLayer.on("mouseup touchend", () => {
		isDragging = false;
	});
};

const createStageAndLayers = () => {
	const stage = new Konva.Stage({
		container: "container",
		width: WIDTH,
		height: HEIGHT,
		x: stagePos.x,
		y: stagePos.y,
	});

	const gridLayer = new Konva.Layer();
	const objectsLayer = new Konva.Layer();
	stage.add(gridLayer, objectsLayer);
	addGridsOnLayer(gridLayer);
	addObjectsOnLayer(objectsLayer);
};

const runKonva = () => {
	createStageAndLayers();
};

window.onload = () => {
	runKonva();
};
