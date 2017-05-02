

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
    if(e.key === key){
         fn(e);
        e.preventDefault();
     }
  });
}

function whenKeyPressed(key, fn){
	onKeyPress(key, body, fn);
}


function playSound(url){
	
	var audio = new Audio(url);
    audio.oncanplay = function() {
        audio.play();
    };
}

var stage = document.getElementById('scratch-stage');
var ctx = stage.getContext("2d");
document.body.appendChild(stage);

var sprites = [];

function redraw(){
  ctx.clearRect(0, 0, stage.width, stage.height);
  var x;
  for(x=0;x<sprites.length;x++){
    sprites[x].draw(ctx);
  }
}

stage.addEventListener("click", function(e){
    var x;
    for(x=0;x<sprites.length;x++){
         sprites[x].handleClick(canvasCoordiatesForEvent(e));
    }
});

var mouseCoordinates = {};

stage.addEventListener("mousemove", function(e){
	mouseCoordinates = canvasCoordiatesForEvent(e)
});

function canvasCoordiatesForEvent(event){
	var cnv = stage;
	var bb = stage.getBoundingClientRect()
	var x = (event.clientX-bb.left) * (cnv.width/bb.width)
	var y = (event.clientY-bb.top) * (cnv.height/bb.height)
	return {x:x,y:y};
}

function find(o, predicate){
	var result;
	each(o, function(item){
		if(predicate(item)){
			result = item;
		}
	});
	return result;
}

function each(o, fn){
	if(o instanceof Array){
		var x;
	    for(x=0;x<o.length;x++){
	         fn(o[x], x);
	    }
	}else{
		var names = o.getOwnPropertyNames();
		var x;
	    for(x=0;x<names.length;x++){
	    	var name = names[x];
	         fn(o[name], name);
	    }
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
	var costume;
	var x, y;
	var rotationDegrees = 0;
	var clickHandlers = [];
	
	setY(config.y);
	setX(config.x);
	
	var costumes = [];
	
	function nextCostume(){
		var idx = costumes.indexOf(costume);
		var next;
		
		if(idx === (costumes.length -1)){
			next = 0;
		}else{
			next = idx + 1;
		}
		costume = costumes[next];
		console.log(next, costume)
		redraw();
	}
	
	function addCostume(name, url){
		var img = new Image();
		costumes.push({name:name, url:url, img:img});
		img.onload = function () {
			redraw();
		}
		img.src = url;
	}
	
	function switchCostumeTo(name){
		costume = find(costumes, function(c){return c.name == name;})
		redraw();
	}
	
	
	function handleClick(c){
		if(isInBounds(c)){
			each(clickHandlers, function(fn){
				fn();
			});
		}
	}
	
	function isInBounds(c){
		var b = bounds();
		
		return (
				   c.x > b.topLeft.x 
					&& 
				   c.y > b.topLeft.y
					&& 
				   c.x < b.bottomRight.x
					&& 
				   c.y < b.bottomRight.y);
	}
	
	function bounds(){
		var width = costume.img.width;
		var height = costume.img.height;
		
		var topLeft = {x:x - (width/2), 
	                   y:y - (height/2)}
	
		var topRight = {x:topLeft.x + width, 
				        y:topLeft.y}
		
		var bottomRight = {x:topRight.x,
				           y:topRight.y + height} 
		
	
		var bottomLeft = {x:bottomRight.x - width,
				           y:bottomRight.y} 
		return {
				topLeft:topLeft,
				topRight:topRight,
				bottomRight:bottomRight,
				bottomLeft:bottomLeft};
	}
	
	function isTouchingMousePointer(){
		return isInBounds(mouseCoordinates);
	}
	function draw(ctx){
		drawRotatedImage(ctx, costume.img, x, y, rotationDegrees);
		
		/*
		var b = bounds();
		ctx.rect(b.topLeft.x, 
				 b.topLeft.y,
				 img.width, 
				 img.height);
		ctx.lineWidth="6";
		ctx.strokeStyle="red";
		ctx.stroke();
		*/
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
	
	function isTouchingEdge(){
		var b = bounds();
		
		return (b.topLeft.x < 0 
		   || 
		   b.topLeft.y < 0
		   ||
		   b.bottomRight.x > stage.width
		   ||
		   b.bottomRight.y > stage.height);
	}
	
	function whenClicked(h){
		clickHandlers.push(h);
	}
	
	
	var me = {
		// framework contract
		draw:draw,
		handleClick:handleClick,
		getX:getX,
		getY:getY,
		
		// scratch-looks
		addCostume:addCostume,
		switchCostumeTo:switchCostumeTo,
		nextCostume:nextCostume,
		
		// scratch-events
		whenClicked:whenClicked,
		
		// scratch-sensing
		isTouchingMousePointer:isTouchingMousePointer,
		isTouchingEdge:isTouchingEdge,
		
		// scratch-motion
		setY:setY,
		setX:setX,
		changeXBy:changeXBy,
		changeYBy:changeYBy,
		rotateDegreesClockwise:rotateDegreesClockwise,
		rotateDegreesCounterClockwise:rotateDegreesCounterClockwise};
	
	sprites.push(me);
	
	addCostume("default", config.costume);
	switchCostumeTo("default");
	
	return me;
}