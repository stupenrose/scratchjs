

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
function drawRotatedImage(context, image, x, y, angle, percentSize) { 
 
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
	var percent = percentSize/100;
	context.drawImage(image, 0, 0, image.width, image.height, -(image.width/2), -(image.height/2), image.width * percent, image.height * percent);
 
	// and restore the co-ords to how they were when we began
	context.restore(); 
}



function drawBubble(context, rectX, rectY, rectWidth, rectHeight, cornerRadius){
      context.beginPath();
      context.moveTo(rectX + cornerRadius, rectY);
      // top
      context.lineTo(rectX + rectWidth - cornerRadius, rectY);
      // top right
      context.arcTo(rectX + rectWidth, 
    		        rectY, 
    		        rectX + rectWidth, 
    		        rectY + cornerRadius, 
    		        cornerRadius);
      // right
      context.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
      
      // bottom right
      context.arcTo(rectX + rectWidth, 
    		        rectY + rectHeight, 
    		        rectX + rectWidth - cornerRadius, 
    		        rectY + rectHeight, 
    		        cornerRadius);
      
      // bottom
      context.lineTo(rectX + cornerRadius, rectY + rectHeight);
      
      // bottom left
//      context.arcTo(rectX, 
//    		        rectY + rectHeight, 
//    		        rectX, 
//    		        rectY + rectHeight - cornerRadius, 
//    		        cornerRadius);
      var spikeWidth = rectHeight / 3;
      var spikeHeight = spikeWidth;
      
      context.lineTo(rectX - spikeWidth, rectY + rectHeight + spikeHeight);
      context.lineTo(rectX, rectY + rectHeight - cornerRadius);
      
      // left
      context.lineTo(rectX, rectY + cornerRadius);
      

      // top left
      context.arcTo(rectX, 
	  		        rectY, 
	  		        rectX + cornerRadius, 
	  		        rectY, 
	  		        cornerRadius);
      context.stroke();
}

function makeSprite(config){
	var name = config.name;
	var costume;
	var x, y;
	var rotationDegrees = 0;
	var clickHandlers = [];
	var percentSize = 100;
	var visible = true;
	
	setY(config.y);
	setX(config.x);
	
	var costumes = [];
	var message = undefined;
	
	function sayForNSeconds(text, n){
		message = {
				text:text,
				timeout: (new Date().getTime() + (n * 1000))
		};
		
		(function handleMessageTimeout(){
			if(!message) return;
			if(new Date().getTime() > message.timeout){
				console.log('Done saying "' + message.text + '"')
				message = undefined;
				redraw();
			}else{
				setTimeout(handleMessageTimeout, 100)
			}
			
		})();
	}
	
	function goToFront(){
		var idx = sprites.indexOf(me);
		sprites.splice(idx, 1);
		
		sprites.push(me);
		
		console.log("At layer " + sprites.indexOf(me));
		
		redraw();
	}
	
	function goBackLayers(n){

		var idx = sprites.indexOf(me);

		var requestedIdx = idx - n;
		
		var newIdx = (requestedIdx >= 0) ? requestedIdx : 0;
		
		sprites.splice(idx, 1);// remove from current position
		sprites.splice(newIdx, 0, me); // add at new position
		
		console.log("At layer " + newIdx);
		
		redraw();
	}
	

	function getSize(){
		return costume.img.width * (percentSize/100);
	}
	
	function changeSizeBy(pixels){
		var renderedSize = costume.img.width * (percentSize/100);
		percentSize = ((renderedSize + pixels)/costume.img.width) * 100;
		redraw();
	}
	
	function setSizeTo(percent){
		percentSize = percent;
		redraw();
	}
	
	function getCostumeNumber(){
		return costumes.indexOf(costume);
	}
	
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
		if(visible) drawRotatedImage(ctx, costume.img, x, y, rotationDegrees, percentSize);
		
		if(message){
			var b = bounds();
			ctx.font = "40px Arial";
			var m = ctx.measureText(message.text);
			
			var margin = 20;
			var textHeight = 28;
			
			ctx.fillText(message.text,b.topRight.x + margin,b.topRight.y );

			ctx.lineWidth="6";
			ctx.strokeStyle="black";
			
			drawBubble(ctx,
					 b.topRight.x, 
					 b.topRight.y - (textHeight + ( margin)),
					 m.width + (2 * margin), 
					 textHeight + (2 * margin),
					 20
					 );
			
			ctx.stroke();
		}
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
	
	function goTo(newX, newY){
		x = newX;
		y = newY;
		redraw();
	}
	
	function pointInDirection(degrees){
		rotationDegrees = degrees;
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
	
	function glideNSecondsToXY(seconds, x, y){
		var framesPerSecond = 30
		var dx = x - getX();
		var dy = y - getY();
		var angleRadians = Math.atan(dy/dx);
		
		var distance = dx / Math.cos(angleRadians);
		var numFrames = seconds * framesPerSecond;
		var frameLengthInMillis = (seconds * 1000)/numFrames;
		var stepsPerFrame = (distance / numFrames);

		var frame = 0;
		(function nextFrame(){
			frame = frame + 1;
			private_moveNStepsInDirection(stepsPerFrame, angleRadians);
			if(frame <= numFrames) {
				setTimeout(nextFrame, frameLengthInMillis);
			}else{
				goTo(x, y);
			}
			console.log(getX(), getY())
		}());
	}
    
	function moveNSteps(n){
		function toRadians (angle) {
	        return angle * (Math.PI / 180);
	    }
		private_moveNStepsInDirection(n, toRadians(rotationDegrees))
	}
	
	function private_moveNStepsInDirection(n, directionInRadians){
	    
	    var x = n * Math.cos(directionInRadians);
		var y = n * Math.sin(directionInRadians);
		
		setX(getX() + x);
		setY(getY() + y);
		redraw();
	}
	
	function show(){
		visible = true;
		redraw();
	}
	

	function hide(){
		visible = false;
		redraw();
	}
	
	function isTouchingColor(color){
		
		function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
		    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}
		
		
//		var ctx = stage.getContext("2d");
//		ctx.fillStyle="#FF0000";
//		ctx.fillRect(getX()+(costume.img.width/2), getY()-(costume.img.height/2), 1, costume.img.height)
		
		
		function leftEdge(){
//			console.log("left");
			return ctx.getImageData(getX()-(costume.img.width/2), getY()-(costume.img.height/2), 1, costume.img.height).data;
		}
		
		function rightEdge(){
//			console.log("right");
			return ctx.getImageData(getX()+(costume.img.width/2), getY()-(costume.img.height/2), 1, costume.img.height).data;
		}
		
		function topEdge(){
//			console.log("top");
			return ctx.getImageData(getX()-(costume.img.width/2), getY()-(costume.img.height/2), costume.img.width, 1).data;
		}
		
		function bottomEdge(){
//			console.log("bottom");
			return ctx.getImageData(getX()-(costume.img.width/2), getY()+(costume.img.height/2), costume.img.width, 1).data;
		}
		
		function hasColor(pixelData){
			var numPixels = pixelData.length/4;
			var result = false;
			for(var x=0;x<pixelData.length;x+=4){
				var hex = rgbToHex(pixelData[x], pixelData[x+1], pixelData[x+2]);
//				console.log(x, hex, componentToHex(pixelData[x+3]));
				if(hex === color){
					return true;
				}
			}
			return result;
		}
		
		return hasColor(leftEdge()) || hasColor(rightEdge()) || hasColor(topEdge()) || hasColor(bottomEdge());
		
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
		setSizeTo:setSizeTo,
		changeSizeBy:changeSizeBy,
		show:show,
		hide:hide,
		goToFront:goToFront,
		goBackLayers:goBackLayers,
		getSize:getSize,
		getCostumeNumber:getCostumeNumber,
		sayForNSeconds:sayForNSeconds,
		
		// scratch-events
		whenClicked:whenClicked,
		
		// scratch-sensing
		isTouchingMousePointer:isTouchingMousePointer,
		isTouchingEdge:isTouchingEdge,
		isTouchingColor:isTouchingColor,
		
		// scratch-motion
		setY:setY,
		setX:setX,
		goTo:goTo,
		changeXBy:changeXBy,
		changeYBy:changeYBy,
		moveNSteps:moveNSteps,
		glideNSecondsToXY:glideNSecondsToXY,
		pointInDirection:pointInDirection,
		rotateDegreesClockwise:rotateDegreesClockwise,
		rotateDegreesCounterClockwise:rotateDegreesCounterClockwise};
	
	sprites.push(me);
	
	addCostume("default", config.costume);
	switchCostumeTo("default");
	
	return me;
}