var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var pyramidalHeight = 100;
var pyramidalBase = pyramidalHeight / Math.sin(Math.PI/3);

var apicalHeight = 100;
var apicalWidth = 10;

var axonLength = 100;
var axonWidth = 10;

var inhibitoryRadius = 40;
var spineWidth = 5;
var spineLength = 20;

var colorBaseStr = 'rgb(';
var colorStep = new Array(3);


/*
var R = 255;
var G = 0;
var B = 0; 
*/

var tri = {
    lowerLeftY: 200,   
    lowerLeftX: 10,

    rgbArray: [185, 185, 185],
    colorStr: null,

    draw: function(){
	ctx.beginPath();
	ctx.moveTo(this.lowerLeftX, this.lowerLeftY);
	ctx.lineTo(this.lowerLeftX + pyramidalBase, this.lowerLeftY);
	ctx.lineTo(this.lowerLeftX + pyramidalBase/2, this.lowerLeftY - pyramidalHeight);	
        this.colorStr = rgb2str(this.rgbArray[0], this.rgbArray[1], this.rgbArray[2]);
	ctx.fillStyle = this.colorStr;
	ctx.fill();
	ctx.fillRect(this.lowerLeftX + pyramidalBase/2 - apicalWidth/2, this.lowerLeftY - pyramidalHeight + 10 - apicalHeight, apicalWidth, apicalHeight);

	ctx.save();
	ctx.fillRect(this.lowerLeftX + pyramidalBase/2 - axonWidth/2, this.lowerLeftY, axonWidth, axonLength);

    }

};

//tri.draw();

var tri2 = {
    lowerLeftY: 200,   
    lowerLeftX: 10 + pyramidalBase + 20,

    rgbArray: [185, 185, 185],
    colorStr: null,

    draw: function(){
	ctx.beginPath();
	ctx.moveTo(this.lowerLeftX, this.lowerLeftY);
	ctx.lineTo(this.lowerLeftX + pyramidalBase, this.lowerLeftY);
	ctx.lineTo(this.lowerLeftX + pyramidalBase/2, this.lowerLeftY - pyramidalHeight);	
        this.colorStr = rgb2str(this.rgbArray[0], this.rgbArray[1], this.rgbArray[2]);
	ctx.fillStyle = this.colorStr;
	ctx.fill();
    }

};

class Pyramidal {
	constructor(x, y){
		this.LLx = x;
		this.LLy = y;
		this.rgb = [185, 185, 185];
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb[0], this.rgb[1], this.rgb[2]);

		//draw soma
		ctx.beginPath();
		ctx.moveTo(this.LLx, this.LLy);
		ctx.lineTo(this.LLx + pyramidalBase, this.LLy);
		ctx.lineTo(this.LLx + pyramidalBase/2, this.LLy - pyramidalHeight);
		ctx.fill();

		//draw apical dendrite
		ctx.fillRect(this.LLx + pyramidalBase/2 - apicalWidth/2, this.LLy - pyramidalHeight + 10 - apicalHeight, apicalWidth, apicalHeight);

		//draw axon
		ctx.fillRect(this.LLx + pyramidalBase/2 - axonWidth/2, this.LLy, axonWidth, axonLength);
	}
}

class Inhibitory {
	constructor(x, y){
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

var pyr1 = new Pyramidal(10, 200);
pyr1.draw();

var pyr2 = new Pyramidal(10 + pyramidalBase + 20, 200);
pyr2.draw();
//tri2.draw();

var inh1 = new Inhibitory(50, 200);
//inh1.draw();

tris = [pyr1, pyr2];
console.log(pyr1.R);
console.log(pyr1.G);
console.log(pyr1.B);

function changeColor(obj,newRGB){
	for (i = 0; i < 3; i++){
		obj.rgbArray[i] = newRGB[i];
	}
	obj.draw();
}


function colorTween(obj, tgtColor, dur, numTimeSteps){

	delay = dur/numTimeSteps;
	

	for(j = 0; j < 3; j++){
		colorStep[j] = Math.floor((tgtColor[j] - obj.rgb[j])/numTimeSteps);
	}

	/*
	colorStepR = tgtR-currR / numTimeSteps;
	colorStepG = tgtG-currG / numTimeSteps;
	colorStepB = tgtB-currB / numTimeSteps;;
	*/

	start = new Date().getTime();
	now = start;	
	while (now < start + dur * 1000){
		
				

		/*
		currR + = colorStepR;
		currG + = colorStepG;
		currB + = colorStepB;
		*/		

		//currColor = colorBaseStr.concat(currR.toString(), ',', currG.toString(), ',', currB.toString(), ')');
		
		for(k = 0; k <3; k++){
			obj.rgbArray[k] += colorStep[k];
		}

		//window.requestAnimationFrame(changeColor(obj,currColor));
		//window.requestAnimationFrame(obj.draw);
		//obj.draw();
		
		now = new Date().getTime();
	}	
}


function colorTween2(obj, tgtColor, dur, numTimeSteps){
	delay = dur/numTimeSteps;

	for(j = 0; j < 3; j++){
		colorStep[j] = Math.floor((tgtColor[j] - obj.rgbArray[j])/numTimeSteps);
	}

	start = new Date().getTime()
	now = start;
	intId = setInterval(function(){

		for(k = 0; k <3; k++){
			obj.rgbArray[k] += colorStep[k];
		}

		obj.draw();
		
		if(new Date().getTime() > start + dur * 1000){
			clearInterval(intId);
			console.log('Done tweening');
		}		
		
	}, delay);
	
}


function colorTweenMulti(obj, tgtColor, dur, numTimeSteps){
	delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 

	// calculate color step for each color channel for each object
	for (var n = 0; n < obj.length; n++){
		for(var j = 0; j < 3; j++){
			colorStep[j] = (tgtColor[j] - obj[n].rgb[j])/numTimeSteps;
		}
	}

	// start the color changes
	start = new Date().getTime()
	now = start;
	intId = setInterval(function(){

		for(var m = 0; m < obj.length; m++){			
			for(var k = 0; k <3; k++){
				obj[m].rgbArray[k] = obj[m].rgbArray[k] + colorStep[k];
			}
			obj[m].draw();	
		}

		if(new Date().getTime() > start + dur * 1000){
			clearInterval(intId);
		}

	}, delay);
}

/*
function flash(objects, tgtColor, numTimes, duration){
	//one "flash" is one cycle of changing color, then changing back to the original color
	//each flash will thus consist of two colorTween operations: one to the new color, then one back to the original color
	//compute the duration of each colorTween (i.e., of each half-cycle of a flash):
	halfCycle = Math.floor(numTimes/duration);

	// need to save the original colors of the objects
	origColors = new Array(objects.length);

	for(){}
}
*/

/*
function rgb2str(R, G, B){
	return colorBaseStr.concat(R.toString(), ',', G.toString(), ',', B.toString(), ')');
}
*/

function rgb2str(R, G, B){
	colorStr = colorBaseStr.concat(String(Math.floor(R)), ',', String(Math.floor(G)), ',', String(Math.floor(B)), ')');
	console.log(colorStr);
	return colorStr;
}

canvas.addEventListener('click', function respond(e){
	colorTweenMulti(tris, [0, 255, 0], 5, 100);
});





       




