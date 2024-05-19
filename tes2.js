// import Konva from "konva";

// const width = window.innerWidth;
// const height = window.innerHeight;

// const stage = new Konva.Stage({
//   container: "container",
//   width: width,
//   height: height,
//   draggable: true, // Make the stage draggable
// });

// const layer = new Konva.Layer();
// stage.add(layer);

// const ball = new Konva.Circle({
//   x: 50,
//   y: 50,
//   radius: 25,
//   fill: 'black',
//   draggable: true,
//   dragBoundFunc: function(pos) {
//     return {
//       x: this.getAbsolutePosition().x, // Keep the x position unchanged
//       y: pos.y, // Allow vertical movement only
//     };
//   },
// });

// layer.add(ball);

// layer.draw();

// let isDragging = false;
// let lastY = 0;

// stage.on('dragstart', function() {
//   isDragging = true;
//   lastY = stage.getPointerPosition().y;
// });

// stage.on('dragend', function() {
//   isDragging = false;
// });

// stage.on('dragmove', function() {
//   if (isDragging) {
//     const newY = stage.getPointerPosition().y;
//     const deltaY = newY - lastY;
//     ball.y(ball.y() + deltaY); // Move the ball vertically
//     lastY = newY;
//     console.log(ball.x(), ball.y())
//     layer.batchDraw(); // Redraw the layer
//   }
// });

import Konva from "konva";

// Create the stage
var stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
});

// Create a layer
var layer = new Konva.Layer();
stage.add(layer);

// Create a ball (circle)
var ball = new Konva.Circle({
  x: 200,
  y: 200,
  radius: 50,
  fill: "red",
  draggable: true,
  dragBoundFunc: function(pos) {
    return {
      x: this.getAbsolutePosition().x,
      y: pos.y
    }
  }
});

// Add the ball to the layer
layer.add(ball);

// Draw the layer
layer.draw();
