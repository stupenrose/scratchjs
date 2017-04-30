

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


function makeSprite(config){
	var name = config.name;
	var view = document.createElement("img");
	var x, y;
	var rotationDegrees = 0;
	view.setAttribute("src", config.costume);
	view.style.position = "absolute";
	setY(config.y);
	setX(config.x);
	document.body.appendChild(view);
	
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
		view.style.left = x;
	}
	function setY(newY){
		y = newY;
		view.style.top = y;
	}
	function whenClicked(fn){
		view.addEventListener("click", fn);
	}
	function rotateDegreesClockwise(n){
		rotationDegrees = rotationDegrees + n;
		view.style.transform = "rotate(" + rotationDegrees + "deg)"
	}
	function rotateDegreesCounterClockwise(n){
		rotationDegrees = rotationDegrees - n;
		view.style.transform = "rotate(" + rotationDegrees + "deg)"
	}
	return {
		whenClicked:whenClicked, 
		setY:setY,
		setX:setX,
		getX:getX,
		getY:getY,
		changeXBy:changeXBy,
		changeYBy:changeYBy,
		rotateDegreesClockwise:rotateDegreesClockwise,
		rotateDegreesCounterClockwise:rotateDegreesCounterClockwise};
}