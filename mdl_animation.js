var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var pyramidalHeight = 50;
var pyramidalBase = pyramidalHeight / Math.sin(Math.PI/3);

var apicalHeight = 100;
var apicalWidth = 5;

var axonLength = 75;
var axonWidth = 5;
var boutonHeight = 15;
var boutonBase = boutonHeight / Math.sin(Math.PI/3);
var fudge = boutonHeight * axonWidth/boutonBase; // this is to make sure that the bouton overlaps with the axon properly

var inhibitoryRadius = 40;
var spineWidth = 5;
var spineLength = 20;

var colorBaseStr = 'rgb(';
var step = new Array(3);


class Pyramidal {
	// x: x-coordinate of lower-left corner of soma
	// y: y-coordinate of lower-left corner of soma
	constructor(x, y){
		this.LLx = x;
		this.LLy = y;
		this.rgb = [185, 185, 185];
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb[0], this.rgb[1], this.rgb[2]);

		// draw soma
		ctx.beginPath();
		ctx.moveTo(this.LLx, this.LLy);
		ctx.lineTo(this.LLx + pyramidalBase, this.LLy);
		ctx.lineTo(this.LLx + pyramidalBase/2, this.LLy - pyramidalHeight);
		ctx.fill();

		// draw apical dendrite
		ctx.fillRect(this.LLx + pyramidalBase/2 - apicalWidth/2, this.LLy - pyramidalHeight + 10 - apicalHeight, apicalWidth, apicalHeight);

		// draw axon
		ctx.fillRect(this.LLx + pyramidalBase/2 - axonWidth/2, this.LLy, axonWidth, axonLength);
		
		// draw bouton
		ctx.moveTo(this.LLx + pyramidalBase/2, this.LLy + axonLength - fudge);
		ctx.lineTo(this.LLx + pyramidalBase/2 - boutonBase/2, this.LLy + axonLength + boutonHeight - fudge);
		ctx.lineTo(this.LLx + pyramidalBase/2 + boutonBase/2, this.LLy + axonLength + boutonHeight - fudge);
		ctx.fill();
	}
}


class Inhibitory {
	constructor(x, y){
		// x: x-coordinate of center of soma
		// y: y-coordinate of center of soma
		this.ctrX = x;
		this.ctrY = y;
		this.r = inhibitoryRadius;
		this.rgb = [185, 185, 185];
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb[0], this.rgb[1], this.rgb[2]);

		//draw soma
		ctx.arc(this.ctrX, this.ctrY, this.r, 0, 2 * Math.PI);
		ctx.fill();

		//draw spines
		ctx.save();
		ctx.translate(this.ctrX, this.ctrY);
		for (var s = 1; s < 3; s++){
			ctx.rotate(2 * Math.PI / 8 * s);
			ctx.fillRect(0, 0, this.r + spineLength, spineWidth);
		}
		ctx.restore();
	}
}


class imgContainer{
	constructor(img){
		this.img = img;
		this.alpha = 100;
		this.draw();	
	}

	draw(){
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(this.img, 0, 0, 100, 100);
	}
}

var pyr1 = new Pyramidal(10, 200);
var pyr2 = new Pyramidal(10 + pyramidalBase + 20, 200);
pyramidals = [pyr1, pyr2];

pyr1.draw();
pyr2.draw();

var spkr = new Image();
//spkr.src = "/home/dan/Documents/animations/speakers.png"
spkr.src = "C:/Users/Dank/Documents/presentations/quals/speakers.png"
spkr.onload = function(){
	ctx.save();
	ctx.translate(200, 100);
	ctx.scale(-1,1);
	ctx.drawImage(spkr, 0, 0, 100, 100);
	ctx.restore()
};
var spkrContainer = new imgContainer(spkr);

console.log(pyr1.constructor.name);
console.log(spkr.constructor.name);

var inh1 = new Inhibitory(50, 200);
//inh1.draw();

function colorTweenMulti(transitions, dur, numTimeSteps){
	delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 

	// for each object to be tweened, compute the appropriate color or alpha steps
	for (var n = 0; n < transitions.length; n++){	
		// if the object to be tweened is a vector graphic object, compute the appropriate color steps 		
		if(transitions[n].obj.constructor.name != "imgContainer"){			
			// do this for each color channel			
			for(var p = 0; p < 3; p++){
				step[p] = (transitions[n].tgt[p] - transitions[n].ojb.rgb[p]) / numTimeSteps;
			}
			transitions[n].step = step;
		}
		// if the object to be tweened is an image container, compute the appropriate alpha step
		else if(transitions[n].obj.constructor.name == "imgContainer"){
			transitions[n].step = (transitions[n].tgt - transitions[n].alpha) / numTimeSteps;
		}
	}

	// start drawing the changes
	start = new Date().getTime()
	now = start;
	intId = setInterval(function(){

		for(var m = 0; m < transitions.length; m++){	

			// if the object to tween is a vector graphics object, update its rgb triple		
			if(transitions[n].obj.constructor.name != "imgContainer"){
				for(var k = 0; k <3; k++){
					transitions[m].obj.rgbArray[k] = transitions[m].obj.rgbArray[k] + transitions.step[k];
				}
			}			

			// if the object to tween is an image container, update its alpha and set the global alpha equal to it
			else if (transitions[n].obj.constructor.name == "imgContainer"){
				transitions[m].obj.alpha = transitions[m].obj.alpha + transitions[m].step;
				ctx.save();				
				ctx.globalAlpha = transitions[m].obj.alpha;
			}			
			transitions[m].obj.draw();	
			ctx.restore();
		}

		if(new Date().getTime() > start + dur * 1000){
			clearInterval(intId);
		}

	}, delay);
}

function rgb2str(R, G, B){
	colorStr = colorBaseStr.concat(String(Math.floor(R)), ',', String(Math.floor(G)), ',', String(Math.floor(B)), ')');
	console.log(colorStr);
	return colorStr;
}

var transition1 = [
{obj: pyr1, tgt: [0, 255, 0]},
{obj: pyr2, tgt: [0, 255, 0]},
{obj: spkr, tgt: [50]}
];

canvas.addEventListener('click', function respond(e){
	colorTweenMulti(pyramidals, [0, 255, 0], 5, 100);
});