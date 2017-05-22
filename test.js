var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
var ctx = canvas.getContext('2d');
var colorBaseStr = 'rgb(';

/*
ctx.save();
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(100, 100, 50, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

ctx.beginPath();
ctx.arc(250, 100, 50, 0, 2 * Math.PI);
ctx.fill();
*/


class Circle {
	constructor(x, y, r){
		this.x = x;
		this.y = y;
		this.r = r;
		this.rgb = [185, 185, 185];
	}

	draw(){
		ctx.save();
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	}
}

function colorTween(obj, tgt, dur, numTimeSteps){
	// transitions: object array describing color/alpha transitions to make
	// dur: total duration of transition in seconds
	// numTimeSteps: number of discrete time steps into which to divide the animation

	var delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 
	var step = new Array(3);
	for (var n = 0; n < 3; n++){
		step[n] = (tgt[n] - obj.rgb[n]) / numTimeSteps;
	}
	console.log('obj.rgb:');
	console.log(obj.rgb);
	console.log('tgt:');
	console.log(tgt);
	console.log('colorstep:');
	console.log(step);
	

	// over the course of tween period, update properties of all objects to be tweened
	var start = new Date().getTime()
	var now = start;
	var intId = setInterval(function(){

		for (var k = 0; k < 3; k++){
			obj.rgb[k] = obj.rgb[k] + step[k];
		}

		ctx.clearRect(0, 0, width, height);
		animate(allObjects);

		if (new Date().getTime() > start + dur * 1000){
			clearInterval(intId);
		}

	}, delay);
}

function animate(all){
	for (var i = 0; i < all.length; i++){
		all[i].draw();
	}
}

function rgb2str(rgb){
	colorStr = colorBaseStr.concat(String(Math.floor(rgb[0])), ',', String(Math.floor(rgb[1])), ',', String(Math.floor(rgb[2])), ')');
	//console.log(colorStr);
	return colorStr;
}

var c1 = new Circle(100, 100, 50); c1.draw();
var c2 = new Circle(250, 100, 50); c2.draw();
var allObjects = [c1, c2];

canvas.addEventListener('click', function respond(e){
	colorTween(c1, [0, 255, 0], 5, 100);
	//colorTween(c2, [0, 255, 0], 5, 100);
	var timer = setTimeout(function(){colorTween(c2, [0, 255, 0], 5, 100)}, 5 * 1000);
});
