window.onresize = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

document.addEventListener("keydown",function(e){
	keysDown[e.keyCode] = true;
});
document.addEventListener("keyup",function(e){
	keysDown[e.keyCode] = false;
});

canvas.addEventListener("touchstart", function(e){
	e.preventDefault();
	handleTouchInput(e);
});

canvas.addEventListener("touchmove", function(e){
	e.preventDefault();
	handleTouchInput(e);
});

canvas.addEventListener("touchend", function(e){
	e.preventDefault();
	handleTouchInput(e);
});

function handleTouchInput(e){
	keysDown[37] = keysDown[39] = false;
	for (var i = 0; i < e.touches.length; i++) {
		 if(e.touches[i].pageX < canvas.width/2){
			 keysDown[37] = true;
		 } else {
			 keysDown[39] = true;
		 }
	}
}
