import Konva from "konva";

const width = window.innerWidth;
const height = window.innerHeight;

let stageScale = 1;
let stagePosition = { x: width / 2, y: height / 2 };
let groundPoints = [-width, 0, width, 0];
let groundPos = { x: 0, y: 200 };

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

const tire = new Konva.Circle({
  x: -200,
  y: stagePosition.y / 2,
  strokeWidth: 2,
  stroke: "black",
  fill: "black",
  radius: 35,
  draggable: true,
  dragBoundFunc: function(pos) {
    return {
      x: this.getAbsolutePosition().x,
      y: pos.y,
    }
  }

});

const innerTire = new Konva.Circle({
  x: tire.x(),
  y: tire.y(),
  strokeWidth: 0.5,
  stroke: "blue",
  fill: "blue",
  radius: 15,
});

const cannonBody = new Konva.Rect({
  x: tire.x() ,
  y: tire.y() -  50,
  width: 180,
  height: 100,
  fill: "grey",
  cornerRadius: [60, 0, 0, 60],
  rotation: 0,
  offsetX: 35,
  offsetY: 50,
});


tire.on("dragmove", function() {
    console.log(`ball: ${this.x(), this.y()}, cannonBody: ${cannonBody.x(), cannonBody.y()}`)
    innerTire.x(this.x());
    innerTire.y(this.y());
    cannonBody.x(this.x());
    cannonBody.y(this.y() -  50);
});

cannonBody.on("wheel", (e) => {
  e.evt.preventDefault();

  let newRotation = cannonBody.rotation() + (e.evt.deltaY > 0 ? 5 : -5);
  newRotation = Math.max(-90, Math.min(90, newRotation));
  cannonBody.rotation(newRotation);
  updateMuzzlePosition();
});

layer.add(ground);
layer.add(cannonBody, tire, innerTire);
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
