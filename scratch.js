

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
	view.setAttribute("src", config.costume);
	view.style.position = "absolute";
	view.style.top = config.y;
	view.style.left = config.x;
	document.body.appendChild(view);
	function whenClicked(fn){
		view.addEventListener("click", fn);
	}
	return {whenClicked:whenClicked};
}