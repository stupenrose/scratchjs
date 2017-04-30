

var body = document.getElementsByTagName('body')[0];


var keysDown = {};
body.addEventListener("keydown", function(e){
  keysDown[e.key] = true;
  e.preventDefault();
});
body.addEventListener("keyup", function(e){
  keysDown[e.key] = false;
  e.preventDefault();
});

function onKeyPress(key, element, fn){
  element.addEventListener("keydown", function(e){
	console.log("Key pressed: " + e.key);
    if(e.key === key){
         fn(e);
        e.preventDefault();
     }
  });
}

function whenKeyPressed(key, fn){
	onKeyPress(key, body, fn);
}



var stage = document.getElementById('scratch-stage');
//var stage = document.createElement("canvas");
var ctx = stage.getContext("2d");
document.body.appendChild(stage);

var sprites = [];

function redraw(){
  console.log("Redraw " + sprites.length + " sprites");
  ctx.clearRect(0, 0, stage.width, stage.height);
  var x;
  for(x=0;x<sprites.length;x++){
    sprites[x].draw(ctx);
  }
}
// http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
var TO_RADIANS = Math.PI/180; 
function drawRotatedImage(context, image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	context.save(); 
 
	// move to the middle of where we want to draw our image
	context.translate(x, y);
 
	// rotate around that point, converting our 
	// angle from degrees to radians 
	context.rotate(angle * TO_RADIANS);
 
	// draw it up and to the left by half the width
	// and height of the image 
	context.drawImage(image, -(image.width/2), -(image.height/2));
 
	// and restore the co-ords to how they were when we began
	context.restore(); 
}
function makeSprite(config){
	var name = config.name;
	var img = new Image();
	var x, y;
	var rotationDegrees = 0;
	
	setY(config.y);
	setX(config.x);
	
	function draw(ctx){
		drawRotatedImage(ctx, img, x, y, rotationDegrees);
	}
	
	function changeXBy(x){
		setX(getX() + x);
	}
	
	function changeYBy(y){
		setY(getY() + y);
	}

	function getX(){
		return x;
	}
	
	function getY(){
		return y;
	}
	
	function setX(newX){
		x = newX;
		redraw();
	}
	function setY(newY){
		y = newY;
		redraw();
	}
	function rotateDegreesClockwise(n){
		rotationDegrees = rotationDegrees + n;
		redraw();
	}
	function rotateDegreesCounterClockwise(n){
		rotationDegrees = rotationDegrees - n;
		redraw();
	}
	var me = {
		draw:draw,
		setY:setY,
		setX:setX,
		getX:getX,
		getY:getY,
		changeXBy:changeXBy,
		changeYBy:changeYBy,
		rotateDegreesClockwise:rotateDegreesClockwise,
		rotateDegreesCounterClockwise:rotateDegreesCounterClockwise};
	sprites.push(me);
	
	img.onload = function () {
		redraw();
	}
	img.src = config.costume;
	
	return me;
}