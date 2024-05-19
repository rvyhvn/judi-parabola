import Konva from "konva";

const width = window.innerWidth;
const height = window.innerHeight;

let stagePosition = { x: width / 2, y: height / 2 };

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
  x: stagePosition.x,
  y: stagePosition.y,
  draggable: true,
});

const layer = new Konva.Layer();

const tire = new Konva.Circle({
  x: -20,
  y: 200,
  strokeWidth: 2,
  stroke: 'black',
  fill: 'black',
  radius: 35,
});

const innerTire = new Konva.Circle({
  x: tire.x(),
  y: tire.y(),
  strokeWidth: 0.5,
  stroke: 'blue',
  fill: 'blue',
  radius: 15,
})

const cannonBody = new Konva.Rect({
  x: tire.x() - tire.radius() - 35,
  y: tire.y() - tire.radius() - 50,
  width: 180,
  height: 100,
  fill: 'grey',
  cornerRadius: [60, 0, 0, 60],
});

const cannonMuzle = new Konva.Rect({
  fill: 'black',
  x: cannonBody.x() + cannonBody.width(),
  y: cannonBody.y(),
  width: 20,
  height: 100,
  stroke: 'black',
  strokeWidth: 1, 
});

layer.add(cannonBody, tire, innerTire, cannonMuzle)
layer.draw()
stage.add(layer);