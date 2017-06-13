// get basic canvas variables
var canvas = document.getElementById('canvas');
var width = screen.width;
var height = screen.height;
var ctx = canvas.getContext('2d');

// define some timing variables
var frameRate = 60; // frames per second
var framePeriod = 1000/frameRate; // milliseconds

// define miscellaneous constants that will be useful later
var colorBaseStr = 'rgba(';
var step = new Array(3);
var blGrey = [185, 185, 185, 1.0];
var lime = [0, 255, 0, 1.0];
var red = [255, 0, 0, 1.0];

// define constants for drawing pyramidals
var pyramidalHeight = 100;
var pyramidalBase = pyramidalHeight / Math.sin(Math.PI/3);
var apicalHeight = height/5;
var apicalWidth = 10;
var pyrLabelSize = 50;
var pyrLabelColor = [185, 185, 185, 1.0];

// define constants for drawing axons
var axonLength = height/5;
var axonWidth = apicalWidth;
var boutonHeight = 25;
var boutonBase = boutonHeight / Math.sin(Math.PI/3);
var fudge = boutonHeight * axonWidth/boutonBase; // this is to make sure that the boutons overlap with the axons properly
var gap = 5; // synaptic gap

// define constants for drawing inhibitory neurons
var inhibitoryRadius = 40;
var spineWidth = apicalWidth;
var spineLength = 20;
var inhibSynLength = 30;
var inhibSynWidth = spineWidth;

// define constants for drawing input box
var inputBoxSize = 150;
var inputColor = [100, 100, 100, 1.0];

// define constants for drawing thalamocortical axons
var tcHorizLength = 150;
var tcVertLength = boutonBase/2 + gap + pyramidalHeight + axonLength + boutonHeight + gap + 2*inhibitoryRadius + spineLength + inputBoxSize/2;
var filterBoxSize = 150;

// define constants for drawing axes
var ssAxisLength = width/4;
var axisThickness = 3;
var text2axis = 50;
var axesLabelSize = 50; 
var axesLabelColor = [185, 185, 185, 1.0];

// define constants for rendering speaker
var spkrSize = 100;
spkrSrc = "/home/dan/Documents/animations/speakers.png"
//spkrSrc = "C:/Users/Dank/Documents/presentations/quals/speakers.png"

// define constants for drawing datapoints
var dataPointRadius = 10; 
var arrowHeadRatio = 2; // ratio of width of arrowhead to width of arrow body


class Pyramidal {
	// x: x-coordinate of lower-left corner of soma
	// y: y-coordinate of lower-left corner of soma
	constructor(x, y){
		this.LLx = x;
		this.LLy = y;
		this.rgb = [185, 185, 185, 1.0];
		this.label = "pyr"; // default; will be changed for pyr2
		this.labelPos = "left"; // default; will be changed for pyr2
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);

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
		ctx.moveTo(0, 0);

		//draw label
		ctx.fillStyle = rgb2str(pyrLabelColor);
		var textY = this.LLy - pyramidalHeight * 0.4;
		var textX = this.LLx - pyrLabelSize * 0.8;
		if(this.labelPos === "right"){
			textX = this.LLx + pyramidalBase;
		} 
		ctx.font = 'italic '.concat(String(pyrLabelSize), "px Georgia");
		ctx.fillText(this.label, textX, textY);
		
	}
}


class Inhibitory {
	constructor(x, y, pyr){
		// x: x-coordinate of center of soma
		// y: y-coordinate of center of soma
		this.ctrX = x;
		this.ctrY = y;
		this.pyr = pyr;
		this.r = inhibitoryRadius;
		this.rgb = [185, 185, 185, 1.0];
		
		if( x < pyr.LLx ){
			this.tgtX = pyr.LLx + pyramidalBase * 0.25;
			this.tgtY = pyr.LLy;
		} else if ( x > pyr.LLx ){
			this.tgtX = pyr.LLx + pyramidalBase * 0.75;
			this.tgtY = pyr.LLy;
		}
		
		this.tgtSpnLength = .97 * Math.sqrt( Math.pow(this.tgtX - this.ctrX, 2) + Math.pow(this.tgtY - this.ctrY, 2) );; // length of the spine that projects to the target pyramidal
		this.tgtSpnAngle = Math.atan(  Math.abs(this.tgtY - this.ctrY)  / Math.abs(this.tgtX - this.ctrX) );

	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);

		//draw soma
		ctx.beginPath();
		ctx.arc(this.ctrX, this.ctrY, this.r, 0, 2 * Math.PI);
		ctx.fill();

		//draw spines
		ctx.save();
		ctx.translate(this.ctrX, this.ctrY);
		for (var s = 1; s < 3; s++){
			ctx.rotate(Math.PI / 4 * s);
			ctx.fillRect(0, -spineWidth/2, this.r + spineLength, spineWidth);
		}
		ctx.restore();
		this.target(this.pyr);
	}

	target(pyr){
		ctx.save()
		ctx.translate(this.ctrX, this.ctrY);
		if ( pyr.LLx < this.ctrX ){
			ctx.scale(-1,1);
		}
		ctx.rotate(-1 * this.tgtSpnAngle);
		ctx.fillRect(0, 0, this.tgtSpnLength, spineWidth);
		ctx.fillRect(this.tgtSpnLength-inhibSynWidth/2, axonWidth/2 - inhibSynLength/2, inhibSynWidth, inhibSynLength);
		ctx.rotate(this.tgtSpnAngle - 0.75 * Math.PI );
		ctx.fillRect(0, -spineWidth/2, this.r + spineLength, spineWidth);
		ctx.restore();
	}
}


class CC {
	// x: x-coordinate of distal edge of bouton
	// y: y-coordinate of midline of axon
	constructor(x, y, origin){
		this.x = x;
		this.y = y;
		this.boutonHeight = boutonHeight;
		this.origin = origin;
		this.rgb = [185, 185, 185, 1.0]; 	
	}

	draw(){
		this.boutonBase = this.boutonHeight / Math.sin(Math.PI/3);
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.beginPath();
		ctx.moveTo(this.x, this.y - this.boutonBase/2);
		ctx.lineTo(this.x, this.y + this.boutonBase/2);
		ctx.lineTo(this.x + this.boutonHeight, this.y);
		ctx.fill();
		ctx.fillRect(this.x, this.y - axonWidth/2, Math.abs(this.origin - this.x), axonWidth);
	}

	// duration: duration of the transformation in seconds
	potentiate(scale, duration, numTimeSteps){
		var self = this;
		var delay = duration/numTimeSteps * 1000;
		var tgtHeight = this.boutonHeight * scale;
		var step = (tgtHeight - this.boutonHeight) / numTimeSteps;
		var start = new Date().getTime(); // start time in milliseconds (UNIX time)
		
		colorTween(self, lime.slice(), 250);				

		var intID = setInterval(function(){
			
						

			self.boutonHeight += step;
			self.draw();
			if(new Date().getTime() > start + duration * 1000){
				clearInterval(intID);
			}
		}, delay)	

		var returnBL = setTimeout(function(){colorTween(self, blGrey, duration);}, duration + 100)
	}
}


class Arrow {
	constructor(ctrX, ctrY, length, width, angle){
		// length: total length of arrow (including arrowhead)
		// width: total width of arrow (including arrowhead)
		// angle: angle of arrow clockwise from vertical, in degrees
		this.ctrX = ctrX;
		this.ctrY = ctrY;		
		this.lengthTotal = length; 
		this.widthTotal = width;  
		this.angle = angle; 
		this.arrowHeadLength = this.widthTotal / 2 * Math.tan(Math.PI/3);
		this.arrowBodyLength = this.lengthTotal - this.arrowHeadLength;
		this.arrowBodyWidth = this.widthTotal / arrowHeadRatio;
		this.rgb = [255, 255, 255, 1.0];
	}

	// draws arrow with the origin in the center
	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.save();
		ctx.translate(this.ctrX, this.ctrY);		
		ctx.save();
		ctx.rotate( Math.PI * (this.angle/180));
		ctx.translate(0, this.arrowLengthTotal/2 - this.arrowBodyLength);
		ctx.fillRect(-this.arrowBodyWidth/2, this.lengthTotal/2 - this.arrowBodyLength - 1, this.arrowBodyWidth, this.arrowBodyLength);
		ctx.beginPath();
		ctx.moveTo(-this.widthTotal/2, this.lengthTotal/2 - this.arrowBodyLength);
		ctx.lineTo(this.widthTotal/2, this.lengthTotal/2 - this.arrowBodyLength);
		ctx.lineTo(0, -this.lengthTotal/2);
		ctx.fill();
		ctx.restore();
		ctx.restore();
	}
}


class TC {
	// pyr: identity of pyramidal cell targeted by TC
	// prferredStim: orentation of preferred direction stimulus
	// lr: whether the axon should target the left side or the right side of the targeted pyramidal cell
	constructor(pyr, preferredStim, lr){
		this.pyr = pyr;
		this.rgb = [185, 185, 185, 1.0];
		this.yOffset = pyr.LLy - pyramidalHeight - gap; // the y-coordinate of the of the TC bouton horizontal midline
		this.lr = lr;
		if (lr === "right"){
			this.sign = 1;
		} else if (lr === "left"){
			this.sign = -1;
		} 
		this.xOffset = pyr.LLx + pyramidalBase/2 + this.sign * (axonWidth/2 + gap)
		this.arrowLengthTotal = filterBoxSize * 0.6;
		this.arrowWidthTotal = filterBoxSize * 0.33;
		this.arrowCtrX = tcHorizLength + axonWidth/2;
		//this.arrowCtrY = tcVertLength/2 + this.arrowLengthTotal/2 - arrowBodyLength;
		this.arrowCtrY = tcVertLength/2;
		this.arrow = new Arrow(0, 0, this.arrowLengthTotal, this.arrowWidthTotal, preferredStim);
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.save();
		ctx.translate(this.xOffset, this.yOffset);
		
		if(this.lr === "left"){
			ctx.scale(-1,1);
		}

		// draw bouton
		ctx.beginPath();
		ctx.moveTo(0, -boutonBase/2);
		ctx.lineTo(0, boutonBase/2);
		ctx.lineTo(boutonHeight, 0);
		ctx.fill();

		// draw horizontal branch
		ctx.fillRect(0, -axonWidth/2, tcHorizLength, axonWidth);

		// draw vertical branch 
		ctx.fillRect(tcHorizLength, -axonWidth/2, axonWidth, tcVertLength);

		// draw box depicting direction filter 
		ctx.beginPath();
		ctx.strokeStyle = rgb2str(this.rgb);
		ctx.lineWidth = axonWidth;
		ctx.fillStyle = "white";
		ctx.rect(tcHorizLength - filterBoxSize/2 + axonWidth/2, tcVertLength/2 - filterBoxSize/2 - axonWidth/2, filterBoxSize, filterBoxSize);
		ctx.fill();
		ctx.stroke();
		
		// draw arrow
		ctx.save();
		ctx.translate(this.arrowCtrX , this.arrowCtrY);
		ctx.rotate(this.preferredStim/360 * 2 * Math.PI);
		this.arrow.rgb = this.rgb;
		this.arrow.draw();
		ctx.restore();

		// draw lower horizontal branch
		ctx.fillStyle = rgb2str(this.rgb);		
		ctx.fillRect(0, tcVertLength - axonWidth * 1.5, tcHorizLength, axonWidth); 
		ctx.restore();
	}
} 


class Axes {
	// xOrig: x-coordinate of origin of axes
	// yOrig: y-coordinate of origin of axes	
	constructor(xOrig, yOrig, xLength, yLength){
		this.xOrig = xOrig;
		this.yOrig = yOrig;
		this.xLength = xLength;
		this.yLength = yLength;
		this.rgb = [185, 185, 185, 1.0];
		this.points = [];
		this.xLabel = "";
		this.yLabel = "";
	}

	draw(){
		ctx.save();
		ctx.translate(this.xOrig, this.yOrig);
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.fillRect(0, 0, this.xLength, axisThickness);
		ctx.fillRect(0, 0, axisThickness, -this.yLength);	
		
		// draw every data point associated with this object		
		for(var p = 0; p < this.points.length; p++){
			this.points[p].draw();
		}		

		// draw labels
		ctx.fillStyle = rgb2str(axesLabelColor);
		ctx.font = 'italic '.concat(String(axesLabelSize),"px Georgia");
		ctx.fillText(this.xLabel, this.xLength/2,  text2axis + axesLabelSize) // x-axis label
		ctx.fillText(this.yLabel, -(axesLabelSize + text2axis),  -this.yLength/2) // y-axis label
		ctx.restore();
	}

	plot(x, y, angle, color, duration){
		// x: x-coordinate of point relative to axis origins
		// y: y-coordinate of point relative to axis origins
		// angle: angle of arrow inscribed in point
		// color: rgba quadruple specifying final point color
		// duration: duration of plotting animation, in seconds
	
		var vertLine = new Rectangle(this.xOrig + x, this.yOrig, axisThickness, -this.yLength); vertLine.rgb = [100, 100, 100, 0.0]; allObjects.push(vertLine); 	
		var horizLine = new Rectangle(this.xOrig + axisThickness, this.yOrig - y, this.xLength, axisThickness); horizLine.rgb = [100, 100, 100, 0.0]; allObjects.push(horizLine); 	
		var dPoint = new dataPoint(this.xOrig + x, this.yOrig - y, [0, 0, 0, 0.0], angle); allObjects.push(dPoint); 	
		
		var d1 = duration * 0.25;
		var d2 = duration * 0.25;
		var d4 = duration * 0.25;

		var l1 = d1 * 0.75;
		var l3 = duration - d4;

		var l2 = l1 + d2 * 0.75;
		var d3 = (duration - l2) * 0.75;	

		var dataPointx = ssAxisLength * 0.1;
		var dataPointy = ssAxisLength * 0.9;

		colorTween(vertLine, [0, 0, 0, 1.0], d1)

		var drawPointTimeout = setTimeout(function(){
			colorTween(dPoint, color, d3);}
		, l2);

		var drawHorizLineTimeout = setTimeout(function(){
			colorTween(horizLine, [0, 0, 0, 1.0], d2);}
		, l1);	

		var eraseGridLinesTransition = [{obj: vertLine, tgt: [100, 100, 100, 0.0]},
						{obj: horizLine, tgt: [100, 100, 100, 0.0]}
				     	       ];	

		var eraseGridLines = setTimeout(function(){
			//console.log('erase grid lines');
			colorTweenMulti(eraseGridLinesTransition, d4);}
		, l3);
		
		self = this;

		var cleanup = setTimeout(function(){
			dPoint.ctrX = x;
			dPoint.ctrY = -y;
			self.points.push(dPoint);
			allObjects.pop();
			allObjects.pop();
			allObjects.pop();
		}, duration + 10)
	
		/*
		var drawVertLineTimeout = setTimeout(function(){
			}
		, drawVertLineDelay * 1000);				
		*/
	

		/*
		var eraseLinesTimeout = setTimeout(function(){
			colorTweenMulti(revTransition, eraseLinesDur, 50);}
		, duration * 1000);
		*/


		// after the animation is complete, pop the lines from allObjects, as we won't need them again
		/*		
		var popTimeout = setTimeout(function(){
			allObjects.pop();
			allObjects.pop();}
		, duration * 1000 +10);
		*/
	}
}


class Rectangle {
	constructor(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height
		this.rgb = [185, 185, 185, 1.0];
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}



class dataPoint {
	// x: x-coordinate of center of datapoint
	// y: y-coordinate of center of datapoint
	// color: rgb array specifying color of datapoint
	// angle: clockwise angle of inscribed arrow relative to vertical, in degrees
	constructor(x, y, color, angle){
		this.ctrX = x;
		this.ctrY = y;
		this.rgb = color;
		this.arrow = new Arrow(0, 0, 2 * dataPointRadius * 0.6, 2 * dataPointRadius * 0.33, angle);
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.save();
		ctx.translate(this.ctrX, this.ctrY);
		ctx.beginPath();
		ctx.arc(0, 0, dataPointRadius, 0, 2 * Math.PI);
		ctx.fill();
		this.arrow.rgb[3] = this.rgb[3];
		this.arrow.draw();
		ctx.restore();
	}
}

var ptSize = 50;
var txtFudgeX = 12;
var txtFudgeY = 22;
class dataPointAsterisk {
	// x: x-coordinate of center of datapoint
	// y: y-coordinate of center of datapoint
	// color: rgb array specifying color of datapoint
	// angle: clockwise angle of inscribed arrow relative to vertical, in degrees
	constructor(x, y, color){
		this.ctrX = x;
		this.ctrY = y;
		this.rgb = color;
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.font = "bold ".concat(String(ptSize), "px Georgia");		
		ctx.save();
		ctx.translate(this.ctrX - txtFudgeX, this.ctrY + txtFudgeY);
		ctx.beginPath();
		ctx.fillText("*", 0, 0);
		ctx.restore();
	}
}


class imgContainer{
	// src: image source
	// x: UL corner x
	// y: UL corner y
	// width: image width
	// height: image height
	// alpha: image alpha 
	constructor(src, x, y, width, height, alpha){
		this.img = new Image();
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alpha = alpha;
		var self = this;
		this.img.onload = function(){self.draw();};	
		this.img.src = src;
	}

	draw(){
		var oldAlpha = ctx.globalAlpha;
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
		ctx.globalAlpha = oldAlpha;
	}
}


class Timer{
	constructor(){
		this.lastTime = 0;
		this.delta = 0;
	}

	initialize(){
		self = this;
		window.requestAnimationFrame(function(timeStamp){
			self.lastTime = timeStamp;	
			//console.log('Timer::initialize timeStamp = '.concat(timeStamp));
		});
	}	
}


class Bezier{
	constructor(c1x, c1y, c2x, c2y, rgb){
		this.c1x = c1x;
		this.c1y = c1y;
		this.c2x = c2x;
		this.c2y = c2y;
		this.rgb = rgb;
	}

	draw(){		
		var bx = pmPointsPre[0].ctrX;
		var by = pmPointsPre[0].ctrY;
		var ex = pmPointsPre[7].ctrX
		var ey = pmPointsPre[7].ctrY;
	
		ctx.strokeStyle = rgb2str(this.rgb);
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(bx, by);
		ctx.bezierCurveTo(this.c1x, this.c1y, this.c2x, this.c2y, ex, ey);
		ctx.stroke();
	}
}


function animate(allTheThings){
	ctx.clearRect(0, 0, 3000, 3000);	
	for(i = 0; i < allTheThings.length; i++){
		allTheThings[i].draw();
	}
}


function flash(transitions, numTimes, duration){
	// transitions: color/alpha transformations to make
	// numTimes: number of times to perform the color/alpha transformations and reverse them
	// duration: duration of each color/alpha transformation in seconds
	// numSteps: number of discrete animation steps per transformation
	
	console.log("	flash()");	

	/*
	var totalDuration = 2*duration*1000*numTimes; // each cycle consists of 2 transitions; each transition is `duration` seconds long; multiply by 1000 to get duration of each cycle in milliseconds; there are `numTimes` cycles over the course of the flash   
	
	console.log(" flash: transitions:");
	console.log(transitions);
	*/	
	
	var halfCycleDuration = duration/(numTimes*2);
	var fdg = 10;	

	// record the original color/alpha state of the objects to be tweened:
	var originals = new Array(transitions.length);
	for (var m = 0; m < transitions.length; m++){
		if (transitions[m].obj.constructor.name != 'imgContainer'){
			originals[m] = transitions[m].obj.rgb.slice();
		} else if (transitions[m].obj.constructor.name == "imgContainer"){
			originals[m] = transitions[m].obj.alpha;
		}
	}
	//console.log('originals');
	//console.log(originals);

	// Initialize an object array representing the reverse transition by creating a 'deep copy' of the original transitions array:
	var reverseTransitions = JSON.parse(JSON.stringify(transitions));	
	
	/* IMPORTANT NOTE: simple assignment ("=") of an array in Javascript does NOT create a copy of that 
	array - it creates a reference!! I.e., if you set 
	
		var reverseTranstion = transitions
		
	then any changes you make to reversetransitions will also be made to transitions! 
	Moreover the common methods for copying arrays - slice() and concat() - do NOT 
	work when the elements of the array are objects! This JSON.parse(JSON.stringify()) 
	trick appears to be necessary */  

	for (var t = 0; t < transitions.length; t++){
		reverseTransitions[t].obj = transitions[t].obj;
		if (transitions[t].obj.constructor.name != "imgContainer"){
			reverseTransitions[t].tgt = transitions[t].obj.rgb.slice();
		} else if (transitions[t].obj.constructor.name == "imgContainer"){
			reverseTransitions[t].tgt = transitions[t].obj.alpha;
		}
	}

	//console.log(" flash: reverseTransitions");
	//console.log(reverseTransitions);

	var it = 0; // current half-cycle; it goes from 0 to 2*numTimes-1
	var accumulatedFudge = 0;

	var flashInt = setInterval(function(){
		if(it > numTimes*2-1){
			clearInterval(flashInt)
		}
		
		// if it's a forward (odd-numbered) transition:
		if(it%2 != 0){
			colorTweenMulti(transitions, halfCycleDuration);
			it++;
		} else{ // if it's a reverse (even-numbered) transition:
			colorTweenMulti(reverseTransitions, halfCycleDuration)
			it++;
		} 		
	},halfCycleDuration + 25);

	/*
	// tween back and forth for the number of specified times
	for(var n = 0; n < numTimes; n++){
		//console.log('iteration:')
		//console.log(n);
		// colorTweenMulti(transitions, duration, numTimeSteps);
		
		fwdFudge = 2*n*fdg;
		revFudge = (2*n+1)*fdg;
			
		var tmr1 = setTimeout(function(){console.log('iteration '.concat(String(it), ' fwd:')); colorTweenMulti(transitions, halfCycleDuration);}, 2*n*halfCycleDuration + fwdFudge);
		console.log('delay = '.concat(String(2*n*halfCycleDuration)));	
		//console.log('reverse');
		// var tmr = setTimeout(function(){colorTweenMulti(reverseTransitions, duration, numTimeSteps);}, duration*1000);
		var tmr2 = setTimeout(function(){console.log('iteration '.concat(String(it), ' reverse:'));colorTweenMulti(reverseTransitions, halfCycleDuration);it++}, ((2*n + 1)*halfCycleDuration + revFudge ));		
		accumulatedFudge += fwdFudge + revFudge;
		console.log('delay = '.concat(String( (2*n + 1)*halfCycleDuration )));
	}

	// after the flashing is complete, ensure that the color of each tweened object goes back EXACTLY to its original color
	var tmr3 = setTimeout(function(){
		for(var p = 0; p < transitions.length; p++){
			if (transitions[p].obj.constructor.name != 'imgContainer'){
				transitions[p].obj.rgb = originals[p];
			} else if (transitions[p].obj.constructor.name == "imgContainer"){
				transitions[p].obj.alpha = originals[p];
			}
		}
		animate(allObjects);
	}, duration + accumulatedFudge) 
	*/

}


function colorTweenMulti2(transitions, dur, numTimeSteps){
	// transitions: object array describing color/alpha transitions to make
	// dur: total duration of transition in seconds
	// numTimeSteps: number of discrete time steps into which to divide the animation

	var delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 

	// for debugging purposes, get the original color or alpha of every object to be tweened
	for (var n = 0; n <transitions.length; n++){
		if (transitions[n].obj.constructor.name != "imgContainer"){
			transitions[n].original = transitions[n].obj.rgb.slice();
		}
		else if (transitions[n].obj.constructor.name == "imgContainer"){
			transitions[n].original = transitions[m].obj.alpha;
		}		
	}

	// for each object to be tweened, compute the appropriate color or alpha steps
	//console.log('colorTweenMulti::transitions:');
	//console.log(transitions);
	var transitions = computeColorStep(transitions, numTimeSteps);	


	// over the course of tween period, update properties of all objects to be tweened
	var start = new Date().getTime()
	var now = start;
	var intId = setInterval(function(){

		for (var m = 0; m < transitions.length; m++){	

			// if the object to tween is a vector graphics object, update its rgb triple		
			if (transitions[m].obj.constructor.name != "imgContainer"){
				for (var k = 0; k <4; k++){
					transitions[m].obj.rgb[k] = transitions[m].obj.rgb[k] + transitions[m].step[k];
				}
			}			

			// if the object to tween is an image container, update its alpha and set the global alpha equal to it
			else if (transitions[m].obj.constructor.name == "imgContainer"){
				transitions[m].obj.alpha = transitions[m].obj.alpha + transitions[m].step;
				ctx.save();				
				//ctx.globalAlpha = transitions[m].obj.alpha;
			}			
			//transitions[m].obj.draw();	
			//ctx.restore();
		}

		animate(allObjects);

		// when the designated tweening period is complete:
		if (new Date().getTime() > start + dur * 1000){

			/* Have noticed that color tweening often doesn't complete perfectly; I suppose 
			this is because `delay` is calculated so that delay * numTimeSteps = duration, but 
			the amount of time between each time step isn't just `delay`; it's `delay` PLUS the 
			amount of time it actually takes the animation code to run, which is non-zero. These
			erros are usually really small, so maybe it wouldn't be noticeable if I just
			manually set the colors to the target values at the end of the tween period*/ 

			for (var p = 0; p < transitions.length; p++){
				// for debugging purposes, after tweening is complete, for each object to be tweened, display the object's original color, target color, computed color step, and current color after tweening:
				//console.log('transition element #'.concat(String(p), ':'));
				//console.log('	obj: '.concat(transitions[p].obj.constructor.name));
				
				if(transitions[p].obj.constructor.name != "imgContainer"){
					//console.log('	starting color: '.concat(rgb2str(transitions[p].original.slice())));		
					//console.log('	target color: '.concat(rgb2str(transitions[p].tgt.slice())));
					//console.log('	step:'.concat(rgb2str(transitions[p].step.slice())));
					//console.log('	final color (before manual correction): '.concat(rgb2str(transitions[p].obj.rgb.slice())));
					for (var k = 0; k <4; k++){
						transitions[p].obj.rgb[k] = transitions[p].tgt[k];
					}	
					//console.log('	final color (after manual correction): '.concat(rgb2str(transitions[p].obj.rgb.slice())));
				}
				else if (transitions[p].obj.constructor.name == "imgContainer"){
					//console.log('	starting alpha: '.concat(String(transitions[p].original)));		
					//console.log('	target alpha: '.concat(String(transitions[p].tgt)));
					//console.log('	step:'.concat(String(transitions[p].step)));
					//console.log('	final alpha (before manual correction): '.concat(String(transitions[p].obj.alpha)));					
					transitions[p].obj.alpha = transitions[p].tgt				
					//console.log('	final alpha (after manual correction): '.concat(String(transitions[p].obj.alpha)));
				}				
			}
			animate(allObjects); // make sure to re-draw everything after manually correcting colors
			clearInterval(intId);
		}

	}, delay);
}


function colorTweenMulti(transitions, dur){
	// transitions: object array describing color/alpha transitions to make
	// dur: total duration of transition in seconds
	// numTimeSteps: number of discrete time steps into which to divide the animation

	// make animationFrame request	
	window.requestAnimationFrame(function(timestamp){
		
		console.log('	colorTweenMulti()');	

		// for debugging purposes, get the original color or alpha of every object to be tweened
		for (var n = 0; n <transitions.length; n++){
			if (transitions[n].obj.constructor.name != "imgContainer"){
				transitions[n].original = transitions[n].obj.rgb.slice();
			}
			else if (transitions[n].obj.constructor.name == "imgContainer"){
				transitions[n].original = transitions[n].obj.alpha;
			}		
		}

		// initialize timer
		var tmr2 = new Timer;	
		tmr2.lastTime = timestamp;
		transitions = computeColorStep(transitions, dur);

		//console.log('colorTweenMulti::transitions:');
		//console.log(transitions);
	
		for (var p = 0; p < transitions.length; p++){
			// for debugging purposes, after tweening is complete, for each object to be tweened, display the object's original color, target color, computed color step, and current color after tweening:
			//console.log('	transition element #'.concat(String(p), ':'));
			//console.log('		obj: '.concat(transitions[p].obj.constructor.name));
			
			if(transitions[p].obj.constructor.name != "imgContainer"){
				//console.log('		starting color: '.concat(rgb2str(transitions[p].original.slice())));		
				//console.log('		target color: '.concat(rgb2str(transitions[p].tgt.slice())));
				//console.log('	speed:'.concat(rgb2str(transitions[p].speed.slice())));
				//console.log('		speed:');
				//console.log(transitions[p].speed);
			}
			else if (transitions[p].obj.constructor.name == "imgContainer"){
				//console.log('		starting alpha: '.concat(String(transitions[p].original)));		
				//console.log('		target alpha: '.concat(String(transitions[p].tgt)));
				//console.log('		step:'.concat(String(transitions[p].speed)));
			}				
		}

		colorTweenMultiStep(timestamp, transitions, tmr2);});
}


function colorTweenMultiStep(timestamp, transitions, timer){

	// If the elapsed time is less than the frame period, do nothing:
	if( timestamp - timer.lastTime < framePeriod ){
		window.requestAnimationFrame(function(timeStamp2){colorTweenMultiStep(timeStamp2, transitions, timer);});
		return;
	}


	//console.log('colorTweenMultiStep:');
	//console.log('	timestamp = '.concat(timestamp));		
	//console.log('	timer.lastTime = '.concat(timer.lastTime));	
	timer.delta += timestamp - timer.lastTime;
	timer.lastTime = timestamp;

	//console.log('	timer.delta = '.concat(timer.delta));
	

	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;
	
	// Evaluate if the tween is complete; if even one color of one object will not be at its target with one more step, then it's not complete
	var cont = 0;
	for(var oInd = 0; oInd < transitions.length; oInd++){
		
		//console.log('	item #'.concat(String(oInd)));
		//console.log('		obj:'.concat(transitions[oInd].obj.constructor.name));
		//console.log('		rgb:'.concat(rgb2str(transitions[oInd].obj.rgb)));
		//console.log('		alpha:'.concat(transitions[oInd].obj.alpha));		
		//console.log('		speed:'.concat(rgb2str(transitions[oInd].speed)));
		//console.log('		speed:'.concat(transitions[oInd].speed));		
		//console.log('		tgt:'.concat(rgb2str(transitions[oInd].tgt)));
		//console.log('		tgt:'.concat(transitions[oInd].tgt));
		
		if(objDoneTweening(transitions[oInd].obj, transitions[oInd].speed, transitions[oInd].tgt, timer) == 0){
			cont = 1;
		}
	}

	// If the tween is not yet complete...
	if(cont == 1){
		
		// ... check which objects in particular are not done tweening...
		for(var oInd = 0; oInd < transitions.length; oInd++){
			var currTransition = transitions[oInd];
			
			//console.log('obj #'.concat(String(oInd), ' complete = ', String(objDoneTweening(currTransition.obj, currTransition.speed, currTransition.tgt, timer)) ));			
				
			// ... and for any objects that are not done tweening...			
			if(objDoneTweening(currTransition.obj, currTransition.speed, currTransition.tgt, timer) == 0){
				//console.log('incomplete tween');
				// ... then if the object is a vector graphics object... 				
				if(currTransition.obj.constructor.name != 'imgContainer'){
					// ... then go through every color/alpha channel and update any that are not done tweening 					
					for(var k =0; k<4; k++){
						if(chDoneTweening(currTransition.obj.rgb[k], currTransition.speed[k], currTransition.tgt[k], timer) == 0){
							currTransition.obj.rgb[k] += currTransition.speed[k] * timeToRender; 
						}
					}
				
				// ... on the other hand, if the object is raster image object that only has an alpha property, then update the alpha.
				} else if (currTransition.obj.constructor.name == 'imgContainer'){
					currTransition.obj.alpha += currTransition.speed * timeToRender;
				}
			}
		}
	
		// render the changes and make a subsequent call to this function
		animate(allObjects);
		timer.delta -= Math.floor(timer.delta/framePeriod) * framePeriod;
		window.requestAnimationFrame(function(timestamp3){colorTweenMultiStep(timestamp3, transitions, timer)});

	// ... on the other hand, if the tween is complete, then manually clean up any errors
	} else{
		//console.log('multi-tween complete');
		for(var oInd = 0; oInd < transitions.length; oInd++){
			var currTransition = transitions[oInd];			
			//console.log('	transition element #'.concat(String(oInd), ':'));
			if(currTransition.obj.constructor.name != 'imgContainer'){
				//console.log('		target color: '.concat(rgb2str(currTransition.tgt.slice())));
				//console.log('		final color (before manual correction): '.concat(rgb2str(currTransition.obj.rgb.slice())));
				for(var k = 0; k < 4; k++){
					currTransition.obj.rgb[k] = currTransition.tgt[k];
				}
				//console.log('		final color (after manual correction): '.concat(rgb2str(currTransition.obj.rgb.slice())));
			} else if(currTransition.obj.constructor.name == 'imgContainer'){
				currTransition.obj.alpha = currTransition.tgt;
			}
		}
		animate(allObjects);

	}
}


function computeColorStep(transitions, duration){
	for (var n = 0; n < transitions.length; n++){	
		// if the object to be tweened is a vector graphic object, compute the appropriate color steps 		
		if(transitions[n].obj.constructor.name != "imgContainer"){			
			// do this for each color channel			
			var speed = new Array(4);			
			for(var p = 0; p < 4; p++){
				speed[p] = (transitions[n].tgt[p] - transitions[n].obj.rgb[p]) / duration;
			}	
			transitions[n].speed = speed.slice();
		}
		// if the object to be tweened is an image container, compute the appropriate alpha step
		else if(transitions[n].obj.constructor.name == "imgContainer"){
			transitions[n].speed = (transitions[n].tgt - transitions[n].obj.alpha) / duration
		}	
	}
	return transitions;
}


function colorTween(obj, tgt, duration){
	console.log("	colorTween()");	
	// compute color steps and stuff
	var speed;

	if(obj.constructor.name != 'imgContainer'){
		var initColor = obj.rgb.slice();		
		var colorSpeed = new Array(3);		
		for (var c = 0; c < 4; c++){
			colorSpeed[c] = (tgt[c] - initColor[c])/duration;
		}	
		speed = colorSpeed;
	} else if(obj.constructor.name == 'imgContainer'){
		//console.log('alpha tweening image container	');
		speed = (tgt - obj.alpha)/duration
		//console.log('obj.alpha = '.concat(String(obj.alpha)));
		//console.log('tgt = '.concat(String(tgt)));
	}

	// initialize timer
	tmr = new Timer;

	// make initial request upon next frame
	window.requestAnimationFrame(function(timeStamp){
		tmr.lastTime = timeStamp	; 
		colorTweenStep(timeStamp, obj, tgt, speed, tmr)});
}


function colorTweenStep(timeStamp, obj, tgt, speed, timer){
	
	//console.log('colorTweenStep::timer');
	//console.log(timer);

	// If the elapsed time is less than the min frame period, then do nothing:
	if( timeStamp - timer.lastTime < framePeriod ){
		window.requestAnimationFrame(function(timeStamp2){colorTweenStep(timeStamp2, obj, tgt, speed, timer);});
		return;
	}
	
	timer.delta += timeStamp - timer.lastTime;
	timer.lastTime = timeStamp;
	timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;

	// Evaluate if the tween is complete; if even one color will not be at its target wirh one more step, then it's not complete
	var cont = 0;
	if(obj.constructor.name != 'imgContainer'){
		for (var c = 0; c < 4; c++){
			if( chDoneTweening(obj.rgb[c], speed[c], tgt[c], timer) == 0 ){
				cont = 1;
			};
		};
	} else if(obj.constructor.name == 'imgContainer'){
		//console.log("	evaluating whenther alpha tween is complete");
		if( chDoneTweening(obj.alpha, speed, tgt, timer)==0 ){
			cont = 1;
		};
	}


	// If the tween is not complete...	
	if(cont == 1){

		if(obj.constructor.name != 'imgContainer'){
			for(var d = 0; d < 4; d++){
			// ...only update colors that need updating; recall that the tween is incomplete if AT LEAST one color will not reach its target with one more step, meaning that the tween could be incomplete 			even if some of the colors are already going to reach their targets
				if( chDoneTweening(obj.rgb[d], speed[d], tgt[d], timer) == 0 ){  
					obj.rgb[d] += speed[d] * timeToRender;
					//console.log('adding color');
				};
			};
		} else if(obj.constructor.name == 'imgContainer'){
			obj.alpha += speed * timeToRender;
		}
		animate(allObjects);
		timer.delta -= Math.floor(timer.delta/framePeriod) * framePeriod;		
		window.requestAnimationFrame(function(timeStamp3){colorTweenStep(timeStamp3, obj, tgt, speed, timer);});	
	
	// If the tween is complete, manually fix any errors	
	} else {
		if(obj.constructor.name != 'imgContainer'	){
			for(var e = 0; e < 4; e++){
				obj.rgb[e] = tgt[e];
				//console.log('tween complete');
			}
		} else if(obj.constructor.name == 'imgContainer'){
			obj.alpha = tgt;
		}
	
		animate(allObjects);
	}
};


function objDoneTweening(obj, speed, tgt, timer){
	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;	
	var done = 0;
	if(obj.constructor.name != 'imgContainer'){
		done = 1;		
		for(var k = 0; k < 4; k++){
			if (chDoneTweening(obj.rgb[k], speed[k], tgt[k], timer) == 0){				
				done = 0;
			}
		}
	} else if(obj.constructor.name == 'imgContainer'){
		if ( ( speed>0 && obj.alpha+speed*timeToRender>=tgt ) || 
		     ( speed<0 && obj.alpha+speed*timeToRender<=tgt ) ||
		       speed == 0){done = 1;}
	}
	//console.log('done = '.concat(String(done)));
	return done;
}


function chDoneTweening(val, speed, tgt, timer){
	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;
	var done = 0;
	//console.log('timer.delta = '.concat(String(timer.delta)));
	//console.log('timeToRender = '.concat(String(timeToRender)));	
	//console.log('val = '.concat(String(val)));
	//console.log('speed = '.concat(String(speed)));
	//console.log('tgt = '.concat(String(tgt)));
	//console.log('val + speed*timeToRender = '.concat(String(val + speed*timeToRender)));
	if( ( speed>0 && val+speed*timeToRender>=tgt ) ||
	    ( speed<0 && val+speed*timeToRender<=tgt ) ||
	      speed == 0){done = 1;}
	return done;
} 


function motionTween(obj, tgt, duration){
	console.log('	 motion tween()');

	// compute color steps and stuff
	var speed = new Array(2);
	
	speed[0] = (tgt[0] - obj.ctrX) / duration; 
	speed[1] = (tgt[1] - obj.ctrY) / duration;

	//console.log('	object: '.concat(obj.constructor.name));
	//console.log('	currX: '.concat(String(obj.ctrX)));
	//console.log('	currY: '.concat(String(obj.ctrY)));
	//console.log('	speedX: '.concat(String(speed[0])));
	//console.log('	speedy: '.concat(String(speed[1])));
	

	// initialize timer
	tmr = new Timer;


	// make initial request upon next frame
	window.requestAnimationFrame(function(timeStamp){
		tmr.lastTime = timeStamp	; 
		motionTweenStep(timeStamp, obj, tgt, speed, tmr)});
}


function motionTweenStep(timeStamp, obj, tgt, speed, timer){
	
	//console.log('colorTweenStep::timer');
	//console.log(timer);

	// If the elapsed time is less than the min frame period, then do nothing:
	if( timeStamp - timer.lastTime < framePeriod ){
		window.requestAnimationFrame(function(timeStamp2){motionTweenStep(timeStamp2, obj, tgt, speed, timer);});
		return;
	}
	
	timer.delta += timeStamp - timer.lastTime;
	timer.lastTime = timeStamp;
	timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;

	// Evaluate if the tween is complete; if even one color will not be at its target wirh one more step, then it's not complete
	var cont = 0;

	if (chDoneTweening(obj.ctrX, speed[0], tgt[0], timer) == 0 || chDoneTweening(obj.ctrY, speed[1], tgt[1], timer) == 0){
		//console.log('motion tweening in progress');
		if( chDoneTweening(obj.ctrX, speed[0], tgt[0], timer) == 0){
				//console.log('x-tweening in progress');
				obj.ctrX += speed[0] * timeToRender;
		}
	
		if( chDoneTweening(obj.ctrY, speed[1], tgt[1], timer) == 0 ){
			//console.log('y-tweening in progress');
			obj.ctrY += speed[1] * timeToRender;
		}	
		
		animate(allObjects);
		timer.delta -= Math.floor(timer.delta/framePeriod) * framePeriod;		
		window.requestAnimationFrame(function(timeStamp3){motionTweenStep(timeStamp3, obj, tgt, speed, timer);});	
	} else{
		obj.ctrX = tgt[0];
		obj.ctrY = tgt[1];
		animate(allObjects);
	}
};


/*
function objDoneMotionTweening(obj, speed, tgt, timer){
	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;	
	var done = 1;		
	if (chDoneTweening(obj.ctrX, speed[0], tgt[0], timer) == 0 ||
chDoneTweening(obj.ctrX, speed[0], tgt[0], timer) == 0
		){				
		done = 0;
	}
	//console.log('done = '.concat(String(done)));
	return done;
}
*/

function rgb2str(rgb){
	colorStr = colorBaseStr.concat(String(Math.floor(rgb[0])), ',', String(Math.floor(rgb[1])), ',', String(Math.floor(rgb[2])), ',', String(rgb[3]), ')');
	//console.log(colorStr);
	return colorStr;
}


// angle away from vertical
function angle2colorN1(angle){

	var frac = Math.cos( Math.PI * (angle/180) ); // the greater the angle, the lower the number	
	var colorOut = frac2color(frac, lime.slice());	
	//console.log('colorOut');
	//console.log(colorOut);
	return colorOut
}


function angle2colorN2(angle){
	var frac = Math.sin( Math.PI * (angle/180) ); // the greater the angle, the higher the number	
	var colorOut = frac2color(frac, lime.slice());	
	//console.log('colorOut');
	//console.log(colorOut);
	return colorOut
}


function angle2colorI1(angle){
	var frac = Math.cos( Math.PI * (angle/180) ); // the greater the angle, the lower the number	
	var colorOut = frac2color(frac, red);
	//console.log('colorOut');
	//console.log(colorOut);
	return colorOut
}


function angle2colorI2(angle){
	var frac = Math.sin( Math.PI * (angle/180) ); // the greater the angle, the higher the number	
	var colorOut = frac2color(frac, red);
	//console.log('colorOut');
	//console.log(colorOut);
	return colorOut
}

function frac2color(frac, tgt){
	var colorOut = new Array(4);	
	for(var k = 0; k < 4; k++){
		colorOut[k] = blGrey[k] + frac*(tgt[k] - blGrey[k]);
	}
	//console.log('colorOut:');
	//console.log(colorOut);
	return colorOut;
}


function doublePlot(ind){
	var tempLineDuration = 500;

	pt1 = ssPointsPre[ind];
	pt2 = pmPointsPre[ind];

	var tempGridLineHoriz = new Rectangle(stateSpaceAxes.xOrig, ssPointsPre[ind].ctrY, (nmAxes.xOrig - stateSpaceAxes.xOrig) + nmAxes.xLength, axisThickness);
	var tempGridLineVert = new Rectangle(ssPointsPre[ind].ctrX, stateSpaceAxes.yOrig, axisThickness, -stateSpaceAxes.yLength);
	var tempGridLineVert2 = new Rectangle(pmPointsPre[ind].ctrX, stateSpaceAxes.yOrig, axisThickness, -stateSpaceAxes.yLength);		
	
	tempGridLineHoriz.rgb = [100, 100, 100, 0.0];	
	tempGridLineVert.rgb = [100, 100, 100, 0.0];	
	tempGridLineVert2.rgb = [100, 100, 100, 0.0];

	allObjects.push(tempGridLineHoriz);	
	allObjects.push(tempGridLineVert);
	allObjects.push(tempGridLineVert2);

	var drawGLtrans = [{obj: tempGridLineHoriz, tgt: inptTxtColor},
			   {obj: tempGridLineVert, tgt: inptTxtColor},
			   {obj: tempGridLineVert2, tgt: inptTxtColor}];
	colorTweenMulti(drawGLtrans, tempLineDuration);

	tgt1 = pt1.rgb.slice();
	tgt2 = pt2.rgb.slice();
	tgt1[3] = 1.0;	
	tgt2[3] = 1.0;
	var drawPtTrans = [{obj: pt1, tgt: tgt1},
			   {obj: pt2, tgt: tgt2}];	
	allObjects.push(pt1);
	allObjects.push(pt2);
	var plotNM = setTimeout(function(){colorTweenMulti(drawPtTrans, tempLineDuration)}, tempLineDuration + 25);

	var eraseGLtrans = [{obj: tempGridLineHoriz, tgt: [100, 100, 100, 0.0]},
		   	    {obj: tempGridLineVert, tgt: [100, 100, 100, 0.0]},
		   	    {obj: tempGridLineVert2, tgt: [100, 100, 100, 0.0]}];
	var eraseTempGridLine = setTimeout(function(){
		colorTweenMulti(eraseGLtrans, tempLineDuration);
	}, tempLineDuration + 10);
}


function doublePlotB(idx){
	var tempLineDuration = 500;

	var dPointX = stateSpaceAxes.xLength * Math.sin( Math.PI*(xArrows[idx].angle/180) );
	var dPointY = stateSpaceAxes.yLength * Math.cos( Math.PI*(xArrows[idx].angle/180) );
	

	var tempGridLine = new Rectangle(stateSpaceAxes.xOrig, stateSpaceAxes.yOrig - dPointY, (nmAxes.xOrig - stateSpaceAxes.xOrig) + nmAxes.xLength, axisThickness);
	tempGridLine.rgb = [100, 100, 100, 0.0];	
	allObjects.push(tempGridLine);	

	stateSpaceAxes.plot(dPointX, dPointY, xArrows[idx].angle, angle2colorN1(xArrows[idx].angle), tempLineDuration);
	colorTween(tempGridLine, inptTxtColor, tempLineDuration);
	var eraseTempGridLine = setTimeout(function(){colorTween(tempGridLine, [100, 100, 100, 0.0], tempLineDuration)}, tempLineDuration);
	var plotNM = setTimeout(function(){nmAxes.plot(xArrows[idx].ctrX - nmAxes.xOrig, dPointY, xArrows[4].angle, angle2colorN1(xArrows[idx].angle), tempLineDuration)}, tempLineDuration + 25);
}


function singlePlotSS(point){
	console.log("	singlePlotSS()");	
	
	allObjects.push(point);
	var tmpGridlineDuration = 500;
	var tempGridLineHoriz = new Rectangle(stateSpaceAxes.xOrig, point.ctrY, stateSpaceAxes.xLength, axisThickness);
	var tempGridLineVert = new Rectangle(point.ctrX, nmAxes.yOrig, axisThickness, -nmAxes.yLength);
	tempGridLineHoriz.rgb = [100, 100, 100, 0.0];
	tempGridLineVert.rgb = [100, 100, 100, 0.0];		
	allObjects.push(tempGridLineHoriz);	
	allObjects.push(tempGridLineVert);

	var drawGLtrans = [{obj: tempGridLineHoriz, tgt: inptTxtColor},
			  {obj: tempGridLineVert, tgt: inptTxtColor}] 
	colorTweenMulti(drawGLtrans, tmpGridlineDuration);	
		
	var tgt = point.rgb.slice();
	tgt[3] = 1.0;	
	var plotPoint = setTimeout(function(){colorTween(point, tgt, tmpGridlineDuration)}, tmpGridlineDuration);
	
	var eraseGLtrans = [{obj: tempGridLineHoriz, tgt: [100, 100, 100, 0.0]},
			  {obj: tempGridLineVert, tgt: [100, 100, 100, 0.0]}] 
	var eraseTempGridLine = setTimeout(function(){colorTweenMulti(eraseGLtrans, tmpGridlineDuration);}, tmpGridlineDuration);
		
}


function singlePlotPMpre(i){
	console.log("	singlePlotPM:");
	
	var point = pmPointsPre[i];
	allObjects.push(point);
	
	var dur = 500;
	
	console.log('Y');
	console.log(point.ctrY);
	console.log('nmAxes.xOrig');
	console.log(nmAxes.xOrig);
	console.log('nmAxes.xLength');
	console.log(nmAxes.xLength);
	console.log('ssAxes.xOrig');
	console.log(stateSpaceAxes.xOrig);
	console.log('width');
	console.log(nmAxes.xOrig + nmAxes.xLength - stateSpaceAxes.xOrig);
	console.log(point.ctrY);
	var horizGL = new Rectangle(ssPointsPre[i].ctrX, point.ctrY, point.ctrX - ssPointsPre[i].ctrX,  axisThickness);
	var vertGL = new Rectangle(xArrows[i].ctrX, nmAxes.yOrig, axisThickness, -(nmAxes.yOrig - point.ctrY));
	horizGL.rgb = [0, 255, 0, 0.0];
	vertGL.rgb = [0, 255, 0, 0.0];
	
	var tgtColor = point.rgb.slice();
	tgtColor[3] = 1.0;
		

	allObjects.push(horizGL);
	allObjects.push(vertGL);
	allObjects.push(point);

	var drawGLtrans = [{obj: horizGL, tgt: [0, 255, 0, 1.0]},
			   {obj: vertGL, tgt: [0, 255, 0, 1.0]}];
	colorTweenMulti(drawGLtrans, dur);
	

	var plotPoint = setTimeout(function(){colorTween(point, tgtColor, dur)}, dur);	
	
	var eraseGLtrans = [{obj: horizGL, tgt: [0, 255, 0, 0.0]}, 
			    {obj: vertGL, tgt: [0, 255, 0, 0.0]}]
	var eraseGL = setTimeout(function(){colorTweenMulti(eraseGLtrans, dur);}, dur)
	

}


function singlePlotPMpost(i){
	console.log("	singlePlotPM:");
	
	var point = pmPointsPost[i];
	allObjects.push(point);
	
	var dur = 500;
	
	console.log('Y');
	console.log(point.ctrY);
	console.log('nmAxes.xOrig');
	console.log(nmAxes.xOrig);
	console.log('nmAxes.xLength');
	console.log(nmAxes.xLength);
	console.log('ssAxes.xOrig');
	console.log(stateSpaceAxes.xOrig);
	console.log('width');
	console.log(nmAxes.xOrig + nmAxes.xLength - stateSpaceAxes.xOrig);
	console.log(point.ctrY);
	var horizGL = new Rectangle(ssPointsPost[i].ctrX, point.ctrY, point.ctrX - ssPointsPost[i].ctrX, axisThickness);
	var vertGL = new Rectangle(xArrows[i].ctrX, nmAxes.yOrig, axisThickness, -(nmAxes.yOrig - point.ctrY));
	horizGL.rgb = [185, 65, 245, 0.0];
	vertGL.rgb = [185, 65, 245, 0.0];
	
	var tgtColor = point.rgb.slice();
	tgtColor[3] = 1.0;
		

	allObjects.push(horizGL);
	allObjects.push(vertGL);
	allObjects.push(point);

	var drawGLtrans = [{obj: horizGL, tgt: [185, 65, 245, 1.0]},
			   {obj: vertGL, tgt: [185, 65, 245, 1.0]}];
	colorTweenMulti(drawGLtrans, dur);
	

	var plotPoint = setTimeout(function(){colorTween(point, tgtColor, dur)}, dur);	
	
	var eraseGLtrans = [{obj: horizGL, tgt: [185, 65, 245, 0.0]}, 
			    {obj: vertGL, tgt: [185, 65, 245, 0.0]}]
	var eraseGL = setTimeout(function(){colorTweenMulti(eraseGLtrans, dur);}, dur)
	

}

// define objects that will appear on axes and 

// draw pyramidals
var pyr1 = new Pyramidal(width*0.125, height*0.4 + pyramidalHeight/2); 
pyr1.label =	 "n1";
pyr1.draw();
var pyr2 = new Pyramidal(pyr1.LLx + pyramidalBase + 20, pyr1.LLy); 
pyr2.label = "n2";
pyr2.labelPos = "right";
pyr2.draw();


// draw inhibitory neurons
var inh1 = new Inhibitory(pyr1.LLx + pyramidalBase/2, pyr1.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr2); inh1.draw(); //inh1.target(pyr2);
var inh2 = new Inhibitory(pyr2.LLx + pyramidalBase/2, pyr2.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr1); inh2.draw(); //inh2.target(pyr1);


// draw corticocorticals
var ccOrigin = pyr2.LLx + pyramidalBase + 200; // x-coordinate of where the cortico-coritcals originate from
var cc1 = new CC(pyr1.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr1.LLy - pyramidalHeight - apicalHeight * .75, ccOrigin); cc1.rgb[3] = 0.0; 
var cc2 = new CC(pyr2.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr2.LLy - pyramidalHeight - apicalHeight * .9, ccOrigin); cc2.rgb[3] = 0.0;
var cc3 = new CC(pyr1.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr1.LLy - pyramidalHeight - apicalHeight * .3, ccOrigin); cc3.rgb[3] = 0.0; 
var cc4 = new CC(pyr2.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr2.LLy - pyramidalHeight - apicalHeight * .45, ccOrigin); cc4.rgb[3] = 0.0; 


// draw thalamocorticals
var tc1 = new TC(pyr1, 0, "left"); tc1.draw();
var tc2 = new TC(pyr2, 90, "right"); tc2.draw();


// render speaker png
var spkrContainer = new imgContainer(spkrSrc, ccOrigin + gap, (cc1.y + cc2.y)/2 - spkrSize/2, spkrSize, spkrSize, 0.0); 
var spkrContainer2 = new imgContainer(spkrSrc, ccOrigin + gap, (cc3.y + cc4.y)/2 - spkrSize/2, spkrSize, spkrSize, 0.0); 

// define and draw state space axes
var stateSpaceOriginX = width*0.45;
var stateSpaceOriginY = height*0.55 + ssAxisLength/2;
var stateSpaceAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, ssAxisLength, ssAxisLength); 
stateSpaceAxes.yLabel = "n1";
stateSpaceAxes.xLabel = "n2";


// draw vertical gradient for state space axes
var gradThickness = 15;
var vertGradX = stateSpaceOriginX - gradThickness - 2;
var vertGradY = stateSpaceOriginY;
var vertGradHeight = ssAxisLength;
var vertGrad = ctx.createLinearGradient(vertGradX+gradThickness/2, vertGradY, vertGradX+gradThickness/2, vertGradY - vertGradHeight);
vertGrad.addColorStop(0, "rgba(185, 185, 185, 1.0)");
vertGrad.addColorStop(1, "rgba(0, 255, 0, 1.0)");
var vertGradScale = {
	x: vertGradX,
	y: vertGradY,
	thickness: gradThickness,
	length: vertGradHeight,
	draw: function(){
		ctx.fillStyle = vertGrad;
		ctx.fillRect(this.x, this.y, this.thickness, -this.length);
	}
};


// draw horizontal gradient for state space axes
var horizGradX = stateSpaceOriginX ;
var horizGradY = stateSpaceOriginY + 5;
var horizGradLength = ssAxisLength;
var horizGrad = ctx.createLinearGradient(horizGradX, horizGradY + gradThickness/2, horizGradX + horizGradLength, vertGradY + gradThickness/2);
horizGrad.addColorStop(0, "rgba(185, 185, 185, 1.0)");
horizGrad.addColorStop(1, "rgba(0, 255, 0, 1.0)");
var horizGradScale = {
	draw: function(){
		ctx.fillStyle = horizGrad;
		ctx.fillRect(horizGradX, horizGradY, horizGradLength, gradThickness);
	}
};


// make another vertical gradient (will be associated with psychometric axes)
var vertGradScale2 = {
	x: vertGradX,
	y: vertGradY,
	thickness: gradThickness,
	length: vertGradHeight,
	draw: function(){
		ctx.fillStyle = vertGrad;
		ctx.fillRect(this.x, this.y, this.thickness, -this.length);
	}
};


/* define neurometric curve axis (but don't draw it yet). 
It will start off in the same position as state space axes, and 
with no X-axis; it will later "slide" out from over the state space
axes, and the X axis will extend out of it
*/
var nmXaxisLength = width/4;
var nmAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, 0, ssAxisLength); // initialize x-origin to the same as that for the state space Axes
nmAxes.yLabel = "n1";
var nmAxesFinal = width * 0.8;  
var arrowsY = nmAxes.yOrig + 20;
var arrowsXstart = nmAxesFinal + 25;
var xArrowWidth = 9;
var xArrowLength = 30;

// define stimulus angles to be presented
var numAngles = 8;
var xArrows = new Array(numAngles);
var preAngles = new Array(numAngles);
var postAngles = new Array(postAngles);
for(var a = 0; a < numAngles; a++){
	angle = 90 - (a * (90/(numAngles-1)));
	preAngles[a] = angle; 
	
	var arrow = new Arrow(arrowsXstart + a*nmXaxisLength/numAngles, arrowsY, xArrowLength, xArrowWidth, angle);		
	arrow.rgb = [185, 185, 185, 0.0];		
	xArrows[a] = arrow;
}


// define post-pairing angles
var postAngles = new Array(xArrows.length);
var rotationFactor = 0.75;
for (var k = 0; k < 4; k++){ // angles in the first half will become more like the first element
	postAngles[k] = xArrows[k].angle + rotationFactor*(xArrows[0].angle - xArrows[k].angle);	
}
for (var m = 4; m < xArrows.length; m++){ // angles in the second half will become more like the last element
	postAngles[m] = xArrows[m].angle + rotationFactor*(xArrows[numAngles-1].angle - xArrows[m].angle);
}


console.log('postAngles');
console.log(postAngles);

// define all the points that will appear in state space axes (but don't render them yet)
//stateSpaceAxes.draw();
var ssPointsPre = new Array(xArrows.length);
var ssPointsPost = new Array(xArrows.length);
for (var p = 0; p < xArrows.length; p++){
	var dPointXpre = 0.1*stateSpaceAxes.xLength + 0.8*stateSpaceAxes.xLength*Math.sin( Math.PI*(xArrows[p].angle/180) );
	var dPointYpre = 0.1*stateSpaceAxes.yLength + 0.8*stateSpaceAxes.yLength*Math.cos( Math.PI*(xArrows[p].angle/180) );
	
	var ssPointPre = new dataPoint(stateSpaceAxes.xOrig + dPointXpre, stateSpaceAxes.yOrig - dPointYpre, lime.slice(), preAngles[p]); //ssPointPre.draw();
	var ssPointPost = new dataPoint(stateSpaceAxes.xOrig + dPointXpre, stateSpaceAxes.yOrig - dPointYpre, [185, 65, 245], preAngles[p]); //ssPointPost.draw(); // post points will be initialize to same position

	ssPointPre.rgb[3] = 0.0 // initialize to be invisible 
	ssPointPost.rgb[3] = 0.0 // initialize to be invisible 

	ssPointsPre[p] = ssPointPre;
	ssPointsPost[p] = ssPointPost;
}

//ssPointsPre[3].draw();

// define the final state space coordinates of post-pairing responses
var postPairFinalPositions = new Array(xArrows.length);
for (var p = 0; p < xArrows.length; p++){
	var dPointX = 0.1*stateSpaceAxes.xLength + 0.8*stateSpaceAxes.xLength*Math.sin( Math.PI*(postAngles[p]/180) );
	var dPointY = 0.1*stateSpaceAxes.yLength + 0.8*stateSpaceAxes.yLength*Math.cos( Math.PI*(postAngles[p]/180) );

	postPairFinalPositions[p] = [dPointX, dPointY];

	//var testPt = new dataPointAsterisk(stateSpaceAxes.xOrig + dPointX, stateSpaceAxes.yOrig - dPointY, blGrey); testPt.draw();
}

console.log('pos pair final positions');
console.log(postPairFinalPositions);

// define all the points that will appear on the psychometric axes (but don't render them yet) for the unpaired stimuli
var pmPointsPre = new Array(xArrows.length);
var pmPointsPost = new Array(numAngles);
for (var q = 0; q < xArrows.length; q++){

	var dPointXpre = xArrows[q].ctrX;
	var dPointYpre = ssPointsPre[q].ctrY;
	var nmPointPre = new dataPoint(dPointXpre, dPointYpre, lime.slice(), xArrows[q].angle); nmPointPre.draw();
	nmPointPre.rgb[3] = 0.0;

	var dPointXpost = xArrows[q].ctrX;
	var dPointYpost = stateSpaceAxes.yOrig - postPairFinalPositions[q][1];
	var nmPointPost = new dataPoint(dPointXpost, dPointYpost, [185, 65, 245, 1.0], xArrows[q].angle); nmPointPost.draw();		
	nmPointPost.rgb[3] = 0.0;
	
	pmPointsPre[q] = nmPointPre;
	pmPointsPost[q] = nmPointPost;
}

bx = pmPointsPre[0].ctrX;
by = pmPointsPre[0]. ctrY;
ex = pmPointsPre[7].ctrX
ey = pmPointsPre[7].ctrY;
/*
ctx.beginPath();
ctx.moveTo(bx, by);
ctx.bezierCurveTo( bx+(ex - bx)*0.75, by, bx+(ex-bx)*0.15, ey - 5, ex, ey);
ctx.strokeStyle = "black";
ctx.stroke();

ctx.beginPath();
ctx.moveTo(bx, by);
ctx.bezierCurveTo(bx+(ex-bx)*0.2, by, bx+(ex-bx)*0.15, ey+100, ex, ey);
ctx.stroke();
*/

var postCurve = new Bezier(bx+(ex - bx)*0.75, by, bx+(ex-bx)*0.15, ey - 5, [185, 65, 245, 1.0]); //postCurve.draw();
postCurve.rgb[3] = 0.0;
var preCurve = new Bezier(bx+(ex-bx)*0.2, by, bx+(ex-bx)*0.15, ey+100, lime.slice()); //preCurve.draw();
preCurve.rgb[3] = 0.0;

// define the post-pairing points that will appear in state space axes



//console.log('postAngles');
//console.log(postAngles);


// define final positions of post-pairing points in state space



// define and draw input box
var pyr1MidBase = pyr1.LLx + pyramidalBase/2;
var pyr2MidBase = pyr2.LLx + pyramidalBase/2;
var midpoint = (pyr1MidBase + pyr2MidBase)/2;
var inptTxtSize = 40;
var inptTxtColor = [100, 100, 100, 1.0];
var inputBox = {
	size: inputBoxSize,
	ULx: midpoint - inputBoxSize/2,
	ULy: pyr1.LLy - pyramidalHeight + tcVertLength - inputBoxSize/2, 
	rgb: [100, 100, 100, 1],

	draw: function(){
		ctx.save();
		ctx.translate(this.ULx, this.ULy);
		ctx.strokeStyle = rgb2str(this.rgb);
		ctx.lineWidth = axonWidth;
		ctx.fillStyle = "white";
		ctx.beginPath();		
		ctx.rect(0, 0, this.size, this.size);
		ctx.fill();		
		ctx.stroke();

		// draw label
		ctx.fillStyle = rgb2str(inptTxtColor);		
		ctx.font = String(inptTxtSize).concat("px Helvetica");
		//ctx.font = String(inptTxtSize).concat("px Georgia");
		//ctx.fillText("INPUT", 0, this.ULy + this.size + inptTxtSize + 10);				
		ctx.fillText("INPUT", 15, this.size + inptTxtSize);

		ctx.restore();

	}
}
inputBox.draw();
var inputBoxCtrX = inputBox.ULx + inputBoxSize/2;
var inputBoxCtrY = inputBox.ULy + inputBoxSize/2;


// define stimulus arrow that will be drawn in input box
var inptArrow = new Arrow(inputBoxCtrX, inputBoxCtrY, inputBoxSize*0.6, inputBoxSize*0.33, 0);
inptArrow.rgb[3] = 0.0; // initialize alpha to 0 


// assemble objects into array
var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, cc3, cc4, tc1, tc2, spkrContainer, spkrContainer2, inputBox, inptArrow];
for(var a = 0; a < xArrows.length; a++){
	allObjects.push(xArrows[a]);
}



var transition2 = [
{obj: inh1, tgt: [255, 0, 0]},
];



//var testStarPoint = new dataPointAsterisk(width/2, height/2, blGrey); testStarPoint.draw(); allObjects.push(testStarPoint);











// show vertical input
function step0(){
	console.log("step0");	
	canvas.removeEventListener('click', step0);
	canvas.addEventListener('click', step1);
	console.log('step 0');
	var step0dur = 300;
	colorTween(inptArrow, inptTxtColor, step0dur); 

	//motionTween(testStarPoint, [width/4, height/2], 1000);
}

// activate tc1, pyr1, and inh1
function step1(){
	console.log("step1");
	canvas.removeEventListener('click', step1);
	canvas.addEventListener('click', step2); 

	var step1dur = 200;
	var step1transitions = [{obj: tc1, tgt: [0, 255, 0, 1.0]},
			        {obj: pyr1, tgt: [0, 255, 0, 1.0]}];
	colorTweenMulti(step1transitions, step1dur);
	var colorInh = setTimeout(function(){colorTween(inh1, [255, 0, 0, 1.0], 250)}, step1dur * 0.75);	

}


// deactivate tc1 and pyr1, activate tc2 and pyr2
function step2(){
	console.log("step2");
	canvas.removeEventListener('click', step2);
	canvas.addEventListener('click', step3);	
	
		
	//{obj: inh1, tgt: [255, 0, 0, 1.0]},
	var t1dur = 200;	
	var transitions1 = [{obj: tc1, tgt: [185, 185, 185, 1.0]},
			    {obj: pyr1, tgt: [185, 185, 185, 1.0]},
			    {obj: inptArrow, tgt: [100, 100, 100, 0.0]},
			    {obj: inh1, tgt: [185, 185, 185, 1.0]}];
	colorTweenMulti(transitions1, t1dur);	

	var t2dur = 500;
	var t2latency = t1dur + 25;
	var transitions2 = [{obj: tc2, tgt: [0, 255, 0, 1.0]},
			    {obj: pyr2, tgt: [0, 255, 0, 1.0]},
			    {obj: inptArrow, tgt: [100, 100, 100, 1.0]}];	
	var doTrans2 = setTimeout(function(){
		inptArrow.angle = 90;
		colorTweenMulti(transitions2, t2dur);
	}, t2latency);
	
	var activateInh = setTimeout(function(){
		colorTween(inh2, [255, 0, 0, 1.0], t2dur * 0.75);
	}, t2latency + t2dur * 0.75);	



//{obj: inh2, tgt: [185, 185, 185, 1.0]}

	/*
	var activatePyr = setTimeout(function(){
		colorTween(pyr2, [0, 255, 0, 1.0], duration);
	}, latency);
	*/

}


// return everything to baseline after initial demonstration of response properties
function step3(){
	console.log("step3");
	canvas.removeEventListener('click', step3);
	canvas.addEventListener('click', step4);
	
	var step3dur = 200;
	var step3transitions = [{obj: tc2, tgt: blGrey},
			        {obj: pyr2, tgt: blGrey},
				{obj: inh2, tgt: blGrey},
			        {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];	
	colorTweenMulti(step3transitions, step3dur);
}


// draw state space axes
function step4(){
	console.log("step4");
	canvas.removeEventListener('click', step4);
	canvas.addEventListener('click', step5);

	allObjects.push(stateSpaceAxes);
	allObjects.push(vertGradScale);
	allObjects.push(horizGradScale);
	animate(allObjects);
}



// present vertical stimuls again
function step5(){
	console.log("step5");
	canvas.removeEventListener('click', step5);
	canvas.addEventListener('click', step6);

	inptArrow.angle = 0	;
	var step5dur = 200;	
	var transitions1 = [{obj: tc1, tgt: lime.slice()},
			    {obj: pyr1, tgt: lime.slice()},
			    {obj: inptArrow, tgt: inptTxtColor},
			    {obj: inh1, tgt: red}];
	colorTweenMulti(transitions1, step5dur);	
}


// show how it would be represented in state space
var p1x = ssAxisLength * 0.1;
var p1y = ssAxisLength * 0.9;
var vertGridLine = new Rectangle(stateSpaceAxes.xOrig + p1x, stateSpaceAxes.yOrig, axisThickness, -stateSpaceAxes.yLength); vertGridLine.rgb = [0, 0, 0, 0.0]; 
var horizGridLine = new Rectangle(stateSpaceAxes.xOrig + axisThickness, stateSpaceAxes.yOrig - p1y, stateSpaceAxes.xLength - axisThickness, axisThickness); horizGridLine.rgb = [0, 0, 0, 0.0]; 
var p = new dataPoint(stateSpaceAxes.xOrig + p1x, stateSpaceAxes.yOrig - p1y, [0, 255, 0, 0.0], 0); 


// first plot the vertical gridline
function step6(){
	console.log("step6");
	canvas.removeEventListener('click', step6);
	canvas.addEventListener('click', step7);

	// push the data point we're going to plot	
	allObjects.push(ssPointsPre[7]);

	// add these objects to allObjects
	allObjects.push(vertGridLine);
	allObjects.push(horizGridLine);
	allObjects.push(p);

	var s6dur = 250;
	colorTween(vertGridLine, inptTxtColor, s6dur);	
}


// plot the horizontal gridline and the point, then erase the gridlines
function step7(){
	console.log("step7");
	canvas.removeEventListener('click', step7);
	canvas.addEventListener('click', step8);


	// line variables
	var duration = 300;
	
	// datapoint variables
	var latency1 = 250; // delay between when the horizontal line starts getting drawn and when the point starts getting drawn, in milliseconds	
	var latency2 = 250; // delay between when the point starts getting drawn and when the grid lines start being erased, in milliseconds	


	// render the line	
	colorTween(horizGridLine, inptTxtColor, duration);

	// after some delay, render the point
	tgt = ssPointsPre[7].rgb.slice();	// alpha of point initially set to 0; want to set tgt that is the same but alpha = 1
	tgt[3] = 1.0; 
	var drawPoint = setTimeout(function(){
		colorTween(ssPointsPre[7], tgt, duration);
	}, latency1);

	// now remove the grid lines
	var rlTransition = [{obj: vertGridLine, tgt: [100, 100, 100, 0.0]},
			    {obj: horizGridLine, tgt: [100, 100, 100, 0.0]}];
	var removeLines = setTimeout(function(){
		colorTweenMulti(rlTransition, duration);
	}, latency1 + latency2);	
}


// plot response to vertical line on psychometric axes with horizontal line connecting to state space
/*
function step9(){
	canvas.removeEventListener('click', step9);
	canvas.addEventListener('click', step10);

	var tmpGridlineDuration = 500;
	
	allObjects.push(pmPointsPre[7]);

	var tempGridLineHoriz = new Rectangle(stateSpaceAxes.xOrig, pmPointsPre[7].ctrY, (nmAxes.xOrig - stateSpaceAxes.xOrig) + nmAxes.xLength, axisThickness);
	var tempGridLineVert = new Rectangle(pmPointsPre[7].ctrX, nmAxes.yOrig, axisThickness, -nmAxes.yLength);
	tempGridLineHoriz.rgb = [100, 100, 100, 0.0];
	tempGridLineVert.rgb = [100, 100, 100, 0.0];		
	allObjects.push(tempGridLineHoriz);	
	allObjects.push(tempGridLineVert);

	var drawGLtrans = [{obj: tempGridLineHoriz, tgt: inptTxtColor},
			  {obj: tempGridLineVert, tgt: inptTxtColor}] 
	colorTweenMulti(drawGLtrans, tmpGridlineDuration);	
		
	var tgt = pmPointsPre[7].rgb.slice();
	tgt[3] = 1.0;	
	var plotPoint = setTimeout(function(){colorTween(pmPointsPre[7], tgt, tmpGridlineDuration)}, tmpGridlineDuration);
	
	var eraseGLtrans = [{obj: tempGridLineHoriz, tgt: [100, 100, 100, 0.0]},
			  {obj: tempGridLineVert, tgt: [100, 100, 100, 0.0]}] 
	var eraseTempGridLine = setTimeout(function(){colorTweenMulti(eraseGLtrans, tmpGridlineDuration);}, tmpGridlineDuration);
}
*/


// show response to horizontal stimulus
function step8(){
	console.log("step8");
	canvas.removeEventListener('click', step8);
	canvas.addEventListener('click', step9);

	// deactivate n1, tc1, inh1 and input arrow
	var deactivateDur = 200;
	var s10erase = [{obj: tc1, tgt: [185, 185, 185, 1.0]},
			{obj: pyr1, tgt: [185, 185, 185, 1.0]},
			{obj: inptArrow, tgt: [100, 100, 100, 0.0]},
			{obj: inh1, tgt: [185, 185, 185, 1.0]}];
	colorTweenMulti(s10erase, deactivateDur);

	// present horizontal stimulus, plot
	var t2dur = 500;
	var t2latency = deactivateDur + 25;
	var transitions2 = [{obj: tc2, tgt: [0, 255, 0, 1.0]},
			    {obj: pyr2, tgt: [0, 255, 0, 1.0]},
			    {obj: inptArrow, tgt: [100, 100, 100, 1.0]}];
	var doTrans2 = setTimeout(function(){
				inptArrow.angle = 90;
				colorTweenMulti(transitions2, t2dur);
			}, t2latency);

	var activateInh = setTimeout(function(){
		colorTween(inh2, [255, 0, 0, 1.0], t2dur * 0.75);
	}, t2latency + t2dur * 0.75);	
}


//plot in state space and psychometric space
function step9(){
	console.log("step9");
	canvas.removeEventListener('click', step9);
	canvas.addEventListener('click', step10);

	var ind = 0;
	var point = ssPointsPre[ind];
	singlePlotSS(point);
	
}


// deactivate pyr2, etc.
function step10(){
	console.log("step10");
	canvas.removeEventListener('click', step10);
	canvas.addEventListener('click', step11);
	
	var dur = 500;
	var transitions = [{obj: tc2, tgt: blGrey},
			   {obj: pyr2, tgt: blGrey},
			   {obj: inh2, tgt: blGrey},
			   {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];
	colorTweenMulti(transitions, dur);
}


// present an intermediate stimulus
function step11(){
	console.log("step11");
	canvas.removeEventListener('click', step11);
	canvas.addEventListener('click', step12);
	
	var dur = 500;
	var angle = xArrows[4].angle; // remember, this is angle away from vertical 
	inptArrow.angle = xArrows[4].angle;
	
	var transitions = [{obj: pyr1, tgt: frac2color(0.3, lime.slice())},
			   {obj: inh1, tgt: frac2color(0.3, red)},
			   {obj: tc1, tgt: frac2color(0.3, lime.slice())},
			   {obj: pyr2, tgt: frac2color(0.3, lime.slice())},
			   {obj: tc2, tgt: frac2color(0.3, lime.slice())},
			   {obj: inh2, tgt: frac2color(0.3, red)},
			   {obj: inptArrow, tgt: inptTxtColor}];

	colorTweenMulti(transitions, 500);	
	//var dur = ;

}


// plot intermediate stimulus in state space and nmAXes
function step12(){
	console.log("step12");
	canvas.removeEventListener('click', step12);
	canvas.addEventListener('click', step13);
	
	var idx = 4;
	var point = ssPointsPre[idx];
	singlePlotSS(point);
}


// return everything to baseline, introduce CCs
function step13(){
	console.log("step13");
	canvas.removeEventListener('click', step13);
	canvas.addEventListener('click', step14);
	
		
	// return everything to baseline
	var blDur = 500;
	var blTrans = [{obj: pyr1, tgt: blGrey},
			   {obj: inh1, tgt: blGrey},
			   {obj: tc1, tgt: blGrey},
			   {obj: pyr2, tgt: blGrey},
			   {obj: tc2, tgt: blGrey},
			   {obj: inh2, tgt: blGrey},
			   {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];
	colorTweenMulti(blTrans, blDur);
}


// introduce cc's
function step14(){
	console.log("step14");
	canvas.removeEventListener('click', step14);
	canvas.addEventListener('click', step15);
	
	var ccDur = 500;
	var ccTrans = [{obj: cc1, tgt: blGrey},
		       {obj: cc2, tgt: blGrey}];
	colorTweenMulti(ccTrans, ccDur);
}


//show that cc's do little on their own in naive state
function step15(){
	console.log("step15");
	canvas.removeEventListener('click', step15);
	canvas.addEventListener('click', step16);
	
	var ccDur = 500;
	var ccTrans = [   {obj: cc1, tgt: lime.slice()},
			   {obj: cc2, tgt: lime.slice()},
			   {obj: spkrContainer, tgt: 1.0}];
	colorTweenMulti(ccTrans, ccDur);
}


//deactivate cc's
function step16(){
	console.log("step16");
	canvas.removeEventListener('click', step16);
	canvas.addEventListener('click', step17);

	var ccDdur = 500;
	var ccDtrans = [   {obj: cc1, tgt: blGrey},
			   {obj: cc2, tgt: blGrey},
			   {obj: spkrContainer, tgt: 0.0}];
	colorTweenMulti(ccDtrans, ccDdur);
}


// do pairing
function step17(){
	console.log("step17");
	canvas.removeEventListener('click', step17);
	canvas.addEventListener('click', step18);

	console.log('py1 color = '.concat(rgb2str(pyr1.rgb)));

	inptArrow.angle = 0;
	var pairingDur = 2000;
	var pairingTrans = [{obj: pyr1, tgt: lime.slice()},
			   {obj: inh1, tgt: red},
			   {obj: tc1, tgt: lime.slice()},
			   {obj: cc1, tgt: lime.slice()},
			   {obj: cc2, tgt: lime.slice()},
			   {obj: spkrContainer, tgt: 1.0},
			   {obj: inptArrow, tgt: inptTxtColor}];
	flash(pairingTrans, 3, pairingDur);

}


// potentiate
function step18(){
	console.log("step18");
	canvas.removeEventListener('click', step18);
	canvas.addEventListener('click', step18b);

	cc1.potentiate(2, 1, 50);
}


function step18b(){
		console.log("step18b");
		canvas.removeEventListener('click', step18b);
		canvas.addEventListener('click', step19);
		colorTween(cc1, blGrey, 250);
}

// show that cc on its own still doesn't do anything after potentiaton
function step19(){
	console.log("step19");
	canvas.removeEventListener('click', step19);
	canvas.addEventListener('click', step20);

	var ccDdur = 500;
	var ccDtrans = [   {obj: cc1, tgt: lime.slice()},
			   {obj: cc2, tgt: lime.slice()},
			   {obj: spkrContainer, tgt: 1.0}];
	colorTweenMulti(ccDtrans, ccDdur);
}


// deactivate cc's
function step20(){
	console.log("step20");
	canvas.removeEventListener('click', step20);
	canvas.addEventListener('click', step21);

	var ccDdur = 500;
	var ccDtrans = [   {obj: cc1, tgt: blGrey},
			   {obj: cc2, tgt: blGrey},
			   {obj: spkrContainer, tgt: 0.0}];
	colorTweenMulti(ccDtrans, ccDdur);
}


// once again present intermediate sitm
function step21(){
	console.log("step21");
	canvas.removeEventListener('click', step21);
	canvas.addEventListener('click', step22);

	var dur = 500;
	var angle = xArrows[4].angle; // remember, this is angle away from vertical 
	inptArrow.angle = xArrows[4].angle;
	
	var transitions = [{obj: pyr1, tgt: frac2color(0.4, lime.slice())},
			   {obj: inh1, tgt: frac2color(0.4, red)},
			   {obj: tc1, tgt: frac2color(0.4, lime.slice())},
			   {obj: pyr2, tgt: frac2color(0.4, lime.slice())},
			   {obj: tc2, tgt: frac2color(0.4, lime.slice())},
			   {obj: inh2, tgt: frac2color(0.4, red)},
			   {obj: inptArrow, tgt: inptTxtColor}];

	colorTweenMulti(transitions, 500);	
}


// present auditory stimulus in addition to it
function step22(){
	console.log("step22");
	canvas.removeEventListener('click', step22);
	canvas.addEventListener('click', step23);

	var ccDdur = 500;
	var ccDtrans = [   {obj: cc1, tgt: lime.slice()},
			   {obj: cc2, tgt: lime.slice()},
			   {obj: spkrContainer, tgt: 1.0}];
	colorTweenMulti(ccDtrans, ccDdur);
}


// and now the system responds as if it has been presented with a vertical stimulus
function step23(){
	console.log("step23");
	canvas.removeEventListener('click', step23);
	canvas.addEventListener('click', step24);

	var transitions = [{obj: pyr1, tgt: lime.slice()},
			   {obj: inh1, tgt: red},
			   {obj: tc1, tgt: frac2color(0.4, lime.slice())},
			   {obj: pyr2, tgt: blGrey},
			   {obj: tc2, tgt: frac2color(0.4, lime.slice())},
			   {obj: inh2, tgt: blGrey}];

	colorTweenMulti(transitions, 500);	
}


// plot response in state space
function step24(){
	console.log("step24");
	canvas.removeEventListener('click', step24);
	canvas.addEventListener('click', step24b);
	
	var point = ssPointsPost[4];	
	singlePlotSS(point);
	
	/*
	var movePt = setTimeout(function(){
		motionTween(point, [stateSpaceAxes.xOrig + postPairFinalPositions[4][0], stateSpaceAxes.yOrig - postPairFinalPositions[4][1]], moveDur);
	}, 500)
	*/
}


function step24b(){
	console.log("step24b");
	canvas.removeEventListener('click', step24b);
	canvas.addEventListener('click', step25);

	var moveDur = 500;
	var point = ssPointsPost[4];	
	motionTween(point, [stateSpaceAxes.xOrig + postPairFinalPositions[4][0], stateSpaceAxes.yOrig - postPairFinalPositions[4][1]], moveDur);
}


// the response in state space moves towards the response to the vertical stimulus
function step25(){
	console.log("step25; pass to 26");
	step26();
	/*
	canvas.removeEventListener('click', step25);
	canvas.addEventListener('click', step26);
	
	
	var point = ssPointsPost[4];
	var moveDur = 500;
	motionTween(point, [stateSpaceAxes.xOrig + postPairFinalPositions[4][0], stateSpaceAxes.yOrig - postPairFinalPositions[4][1]], moveDur);
	*/
}


// return everything to baseline
function step26(){
	console.log("step26");
	canvas.removeEventListener('click', step25);
	canvas.addEventListener('click', step27);

	var step3dur = 200;
	var step3transitions = [{obj: tc1, tgt: blGrey},
			        {obj: pyr1, tgt: blGrey},
				{obj: inh1, tgt: blGrey},
				{obj: tc2, tgt: blGrey},
				{obj: cc1, tgt: blGrey},
				{obj: cc2, tgt: blGrey},
				{obj: spkrContainer, tgt: 0.0},
			        {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];	
	colorTweenMulti(step3transitions, step3dur);

}


// introduce new cc's
function step27(){
	console.log("step27");
	canvas.removeEventListener('click', step27);
	canvas.addEventListener('click', step28);

	var ccDur = 500;
	var ccTrans = [{obj: cc3, tgt: blGrey},
		       {obj: cc4, tgt: blGrey}];
	colorTweenMulti(ccTrans, ccDur);	
}


// pair new cc's with horizontal
function step28(){
	console.log("step28");
	canvas.removeEventListener('click', step28);
	canvas.addEventListener('click', step28b);
	inptArrow.angle = 90;
	var pairingDur = 2000;
	var pairingTrans2 = [{obj: pyr2, tgt: lime.slice()},
			   {obj: inh2, tgt: red},
			   {obj: tc2, tgt: lime.slice()},
			   {obj: cc3, tgt: lime.slice()},
			   {obj: cc4, tgt: lime.slice()},
			   {obj: spkrContainer2, tgt: 1.0},
			   {obj: inptArrow, tgt: inptTxtColor}];
	flash(pairingTrans2, 3, pairingDur);
}


function step28b(){
	console.log("step28b");
	canvas.removeEventListener('click', step28b);
	canvas.addEventListener('click', step28c);
	cc4.potentiate(2, 1, 50);

}


function step28c(){
	console.log("step28c");
	canvas.removeEventListener('click', step28c);
	canvas.addEventListener('click', step29);
	
	colorTween(cc4, blGrey, 250);
}

// show an intrmediate stimulus, slightly towards horizontal
function step29(){
	console.log("step29");
	canvas.removeEventListener('click', step29);
	canvas.addEventListener('click', step30);

	var ind = 3;
	inptArrow.angle = preAngles[ind];

		
	var transitionsUnique = [{obj: pyr1, tgt: frac2color(0.3, lime.slice())},
			   {obj: inh1, tgt: frac2color(0.3, red)},
			   {obj: tc1, tgt: frac2color(0.3, lime.slice())},
			   {obj: pyr2, tgt: frac2color(0.3, lime.slice())},
			   {obj: tc2, tgt: frac2color(0.3, lime.slice())},
			   {obj: inh2, tgt: frac2color(0.3, red)},
			   {obj: inptArrow, tgt: inptTxtColor}];

	colorTweenMulti(transitionsUnique, 500);
}


// plot response in state space
function step30(){
	console.log("step30");
	canvas.removeEventListener('click', step30);
	canvas.addEventListener('click', step31);
	//console.log('literally do nothing');

	
	var ind = 3;
	var point = ssPointsPre[ind];
	allObjects.push(point);
	
	singlePlotSS(point);
	

	/*
	var tgt = point.rgb.slice();
	tgt[3] = 1.0;
	colorTween(point, tgt, 500);
	*/
};


// now present auditory stim on top of it
function step31(){
	console.log("step31");
	canvas.removeEventListener('click', step31);
	canvas.addEventListener('click', step32);

	var ccDdur = 500;
	var ccDtrans = [   {obj: cc3, tgt: lime.slice()},
			   {obj: cc4, tgt: lime.slice()},
			   {obj: pyr2, tgt: lime.slice()},
			   {obj: inh2, tgt: red},
			   {obj: pyr1, tgt: blGrey},
			   {obj: inh1, tgt: blGrey},
			   {obj: spkrContainer2, tgt: 1.0}];
	colorTweenMulti(ccDtrans, ccDdur);	
}


// plot response in state space	
function step32(){
	console.log("step32");
	canvas.removeEventListener('click', step32);
	canvas.addEventListener('click', step32b);	
	
	var ind = 3;
	var point = ssPointsPost[ind];
	allObjects.push(point);
	singlePlotSS(point);
	
	/*
	var plotResp = setTimeout(function(){
		motionTween(point, [stateSpaceAxes.xOrig + postPairFinalPositions[ind][0], stateSpaceAxes.yOrig -postPairFinalPositions[ind][1]], 500)
	}, 500);
	*/
}


// show it move
function step32b(){
	console.log("step32b");
	canvas.removeEventListener('click', step32b);
	canvas.addEventListener('click', step33);	

	var ind = 3;
	var point = ssPointsPost[ind];
	motionTween(point, [stateSpaceAxes.xOrig + postPairFinalPositions[ind][0], stateSpaceAxes.yOrig -postPairFinalPositions[ind][1]], 500)
}


// return everything to baseline
function step33(){
	console.log("step33");
	canvas.removeEventListener('click', step33);
	canvas.addEventListener('click', step34);	

	var step3dur = 200;
	var step3transitions = [{obj: tc2, tgt: blGrey},
			        {obj: pyr2, tgt: blGrey},
				{obj: inh2, tgt: blGrey},
				{obj: tc1, tgt: blGrey},
				{obj: cc3, tgt: blGrey},
				{obj: cc4, tgt: blGrey},
				{obj: spkrContainer2, tgt: 0.0},
			        {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];	
	colorTweenMulti(step3transitions, step3dur);	
}


// plot the remaining pre-pairing data points
var leftOverPoints = [1, 2, 5, 6];
function step34(){
	console.log("step34");
	canvas.removeEventListener('click', step34);
	canvas.addEventListener('click', step34b);	

	var pLOint = 500;
	var i = 0;
	var plotLeftOvers = setInterval(function(){
		if(i >= leftOverPoints.length-1){
			clearInterval(plotLeftOvers);
		}		
	
		singlePlotSS(ssPointsPre[leftOverPoints[i]]);		

		/*
		inptArrow.angle = preAngles[leftOverPoints[i]];
		var ploTrans = [{obj: pyr1, tgt: angle2colorN1(preAngles[leftOverPoints[i]])},
				{obj: tc1, tgt: angle2colorN1(preAngles[leftOverPoints[i]])},
				{obj: inh1, tgt: angle2colorI1(preAngles[leftOverPoints[i]])},
				{obj: pyr2, tgt: angle2colorN2(preAngles[leftOverPoints[i]])},
				{obj: tc2, tgt: angle2colorN2(preAngles[leftOverPoints[i]])},
				{obj: inh2, tgt: angle2colorI2(preAngles[leftOverPoints[i]])},
				{obj: inptArrow, tgt: inptTxtColor},]
		flash(ploTrans, 1, 500);
		*/

		i++;
	},pLOint)
}


// plot remaining post points in state space
var leftOverPointsPost = [0, 1, 2, 5, 6, 7];
function step34b(){
	console.log("step34b");
	canvas.removeEventListener('click', step34b);
	canvas.addEventListener('click', step34c);	

	var dur = 250;
	var ppTrans = new Array(leftOverPointsPost.length);
	for(var p = 0; p < leftOverPointsPost.length; p++){
		var point = ssPointsPost[leftOverPointsPost[p]];		
		console.log('point');
		console.log(point);		
		allObjects.push(point);
		ppTrans[p] = {obj: inptArrow, tgt: blGrey} // initialize		
		ppTrans[p].obj = point;
		ppTrans[p].tgt = ppTrans[p].obj.rgb.slice();
		ppTrans[p].tgt[3] = 1.0;
	}
	
	console.log('ppTrans');
	console.log(ppTrans);		
	colorTweenMulti(ppTrans, dur);
}


function step34c(){
	console.log("step34c");
	canvas.removeEventListener('click', step34c);
	canvas.addEventListener('click', step35);

	var dur = 500;
	
	//motionTween(ssPointsPost[0], postPairFinalPositions[0], dur);
	
	for(var p = 0; p < leftOverPointsPost.length; p++){
		var point = ssPointsPost[leftOverPointsPost[p]];
		var tgtCoords = postPairFinalPositions[leftOverPointsPost[p]];
		var tgtCoordsCtr = new Array(2);		
		tgtCoordsCtr[0] = stateSpaceAxes.xOrig + tgtCoords[0];
		tgtCoordsCtr[1] = stateSpaceAxes.yOrig - tgtCoords[1];
		motionTween(point, tgtCoordsCtr, dur); 
	}	

	
}

// have psychometric space slide out from state space
function step35(){
	console.log("step35");
	canvas.removeEventListener('click', step35);
	canvas.addEventListener('click', step36);	

	// pop out those grid lines objects, which we don't need anymore	
	allObjects.pop(); 
	allObjects.pop();	

	// push objects to start being drawn:
	allObjects.push(nmAxes);
	allObjects.push(vertGradScale2);	
	
	// variables controlling timing of translation:	
	var distance = nmAxesFinal - nmAxes.xOrig;	
	var slideDuration = 500;
	var vel = distance / slideDuration;  
	
	// variables controlling timing of x-scaling:
	var scaleDuration = 0.25;
	var numScaleSteps = 50;	
	var scaleTimeStep = (scaleDuration/numScaleSteps) * 1000;
	var scaleStep = nmXaxisLength/numScaleSteps;

	// variables needed for plotting arrows along x-axis:
	var timePerArrow = 100; // time it takes to draw each individual arrow;
	var arrowDurTotal = 1; // time between beginning to draw first arrow and beginning to draw last arrow
	
	// local functions needed for animation:	
	window.requestAnimationFrame(function(timeStamp){
		var tmr = new Timer;
		tmr.lastTime = timeStamp;
		translateNM(timeStamp, tmr);
	});

	function updateXorig(delta){
		nmAxes.xOrig += vel * delta;		
		animate(allObjects);
	};

	function translateNM(timeStamp, tmr){
		if( timeStamp - tmr.lastTime < framePeriod ){
			window.requestAnimationFrame(function(timeStamp2){translateNM(timeStamp2, tmr);});
			return;
		}		

		tmr.delta += timeStamp - tmr.lastTime;
		tmr.lastTime = timeStamp;
		timeToRender = Math.floor(tmr.delta/framePeriod) * framePeriod;		

		// If the slide isn't done yet...
		if(nmAxes.xOrig + vel * timeToRender < nmAxesFinal){
			nmAxes.xOrig += vel * timeToRender;
			vertGradScale2.x += vel * timeToRender;
			tmr.delta -= timeToRender;
			animate(allObjects); 
			window.requestAnimationFrame(function(timeStamp3){
				translateNM(timeStamp3, tmr)
			});
		
		// If the slide is done...
		} else { 
			console.log('finish translation');			
	
			// ...clean up any errors in the tweening
			nmAxes.xOrig = nmAxesFinal - 20; // no idea why I have to do this fudge but I do
			vertGradScale2 = nmAxesFinal;
			animate(allObjects);

			// ... extend the x-axis...
			var extendXaxis = setInterval(function(){
				nmAxes.xLength += scaleStep;
				animate(allObjects);

				if(nmAxes.xLength + scaleStep > nmXaxisLength){										
					nmAxisLength = nmXaxisLength;
					clearInterval(extendXaxis);
				}
			}, scaleTimeStep);

			// ... and draw the arrows along the x-axis
			var arrowIndex = 0;
			//console.log('arrows inside translateNM:');
			//console.log(arrows);
			var drawArrows = setInterval(function(){
				if(arrowIndex > numAngles - 1){
					console.log('done drawing arrows');
					clearInterval(drawArrows);
				} else{
					console.log('arrowIndex = '.concat(String(arrowIndex)));
					colorTweenMulti([{obj: xArrows[arrowIndex], tgt: [185, 185, 185, 1.0]}], timePerArrow, 50);
					arrowIndex += 1;
				}
				
			}, arrowDurTotal/numAngles * 1000)
			
		}
	};

}


// project pre-points onto pm space
function step36(){
	console.log('step36');
	canvas.removeEventListener('click', step36);
	canvas.addEventListener('click', step36b);

	var i = 0;
	var int = 500;
	var plotPMpre = setInterval(function(){
		if(i >= numAngles -1){
			clearInterval(plotPMpre);
		}		
		

		singlePlotPMpre(i);

		i++;
	}, int);	
}

function step36b(){
	console.log('step36b');
	canvas.removeEventListener('click', step36b);
	canvas.addEventListener('click', step37);
	
	var dur = 500;
	allObjects.push(preCurve);
	colorTween(preCurve, lime.slice(), dur);
}


function step37(){
	console.log('step37');
	canvas.removeEventListener('click', step37);
	canvas.addEventListener('click', step38);

	var i = 0;
	var int = 500;
	var plotPMpre = setInterval(function(){
		if(i >= numAngles -1){
			clearInterval(plotPMpre);
		}		
		

		singlePlotPMpost(i);

		i++;
	}, int);	
}


function step38(){
	console.log('step38');
	canvas.removeEventListener('click', step38);
	
	var dur = 500;
	allObjects.push(postCurve);
	colorTween(postCurve, [185, 65, 245, 1.0], dur);
}


function testDoublePlot(){
	canvas.removeEventListener('click', step14);
	canvas.addEventListener('click', step15);

	var interval = 250;	
	var idx = 0;
		

	var doPlots = setInterval(function(){
		if (idx >= xArrows.length){
			clearInterval(doPlots);
		}
		inptArrow.angle = xArrows[idx].angle;
		colorTween(inptArrow, 100);		
		doublePlot(idx);
		var eraseArrow = setTimeout(function(){colorTween(inptArrow, [100, 100, 100, 0.0])}, 100)
		idx++;
	}, interval)

}

/*
function step15(){
}
*/

/*



function step6(){


	allObjects.push(stateSpaceAxes);		




}


// draw horizontal gridline in ssAxes, plot point, and erase gridline
function step5(){



}


function step6(){

	
	console.log('allObjects');
	console.log(allObjects);

	console.log('xArrows');
	console.log(xArrows);




}


function step6(){
	canvas.removeEventListener('click', step6);
	canvas.addEventListener('click', step7);

	// do some cleanup from the previous step; transfer the datapoint from allObjects to be a chile of stateSpaceAxes	
	allObjects.pop();	
	p.ctrX = p1x; // make the coordinates relative to the origin of stateSpaceAxes
	p.ctrY = -p1y; // make the coordinates relative to the origin of stateSpaceAxes	
	stateSpaceAxes.points.push(p);

	// also pop out those grid lines objects, which we don't need anymore	
	allObjects.pop(); 
	allObjects.pop();

	nmAxes.draw();
	var lastFrameTimeMs = 0;	
	
	

	//window.requestAnimationFrame(initializeLastFrame);
	//window.requestAnimationFrame(translateNM);
}

function step7(){

	//console.log('stateSpaceAxes.points:');
	//console.log(stateSpaceAxes.points);

	//tempGridLine.draw();	

	
	//nmAxes.plot(nmAxes.xLength * 0.5, nmAxes.yLength * 0.5, 0, [0, 255, 0, 1.0], 1000);	
	//animate(allObjects);
}
*/

function step1alt(){
	canvas.removeEventListener('click', step1alt);
	//canvas.addEventListener('click', step2alt);
	
	console.log('step1alt');
	//colorTween(spkrContainer, 1.0, 1000);
	//colorTween(pyr2, [0, 255, 0, 1.0], 1000);
	
	transitions = [{obj:cc1, tgt:[0, 255, 0, 1.0]},
		       {obj:tc2, tgt:[0, 255, 0, 1.0]},
		       {obj:pyr2, tgt:[0, 255, 0, 1.0]},
		       //{obj:spkrContainer, tgt: 1.0},
	
		      ];
	flash(transitions, 3, 1000);
}


function step2alt(){
	canvas.removeEventListener('click', step2alt);
	console.log('step2alt');
	animate(allObjects);
}

/*
function step2(){
	canvas.removeEventListener('click', step2);


	var drawVertLineDelay = 0; // in milliseconds!
	var drawHorizLineDelay = 10; // in milliseconds!
	var drawPointDelay = 100; // in milliseconds!

	var drawVertLineDuration = 0.5; // in seconds!
	var drawHorizLineDuration = 0.5; // in seconds!
	var drawPointDuration = 0.5; // inseconds!
	
	var dataPointx = ssAxisLength * 0.1;
	var dataPointy = ssAxisLength * 0.9;

	var vertLine = new Rectangle(stateSpaceOriginX + dataPointx, stateSpaceOriginY, axisThickness, -ssAxisLength); vertLine.rgb = [0, 255, 0, 0.0]; allObjects.push(vertLine); 	
	var horizLine = new Rectangle(stateSpaceOriginX, stateSpaceOriginY - dataPointy, ssAxisLength, axisThickness); horizLine.rgb = [0, 255, 0, 0.0]; allObjects.push(horizLine); 	
	var dPoint = new dataPoint(stateSpaceOriginX + dataPointx, stateSpaceOriginY - dataPointy, [0, 255, 0, 0.0], 0); allObjects.push(dPoint); 	
	
	var vTransition = [{obj: vertLine, tgt: [0, 255, 0, 1.0]},
			   //{obj: horizLine, tgt: [0, 255, 0, 1.0]}
			  ];
	
	var hTransition = [//{obj: vertLine, tgt: [0, 255, 0, 1.0]},
			   {obj: horizLine, tgt: [0, 255, 0, 1.0]}
			  ];

	var dTransition = [{obj:dPoint, tgt:[0, 255, 0, 1.0]}];

	//colorTweenMulti(vTransition, drawVertLineDuration, 50);

	var drawVertLineTimeout = setTimeout(function(){
		flash(vTransition, 1, drawVertLineDuration, 50);}
	, drawVertLineDelay);
		
	var drawVertLineTimeout = setTimeout(function(){
		flash(hTransition, 1, drawHorizLineDuration, 50);}
	, drawHorizLineDelay);	

	var drawPointTimeout = setTimeout(function(){
		colorTweenMulti(dTransition, drawPointDuration, 50);}
	, drawPointDelay);	

	var nextStepTimeOut = setTimeout(function(){
		canvas.addEventListener('click', step3);}
	, drawPointDelay + drawPointDuration);
}



function step3(){
	canvas.removeEventListener('click', step3);
	var x = ssAxisLength / 2;
	var y = ssAxisLength / 2;
	var color = [0, 255, 0, 1.0];
	stateSpaceAxes.plot(x, y, 45, color, 5);
	
	var nextStepTimeOut = setTimeout(function(){canvas.addEventListener('click', step4);}, 2000)
}





function step5(){
	canvas.removeEventListener('click', step5);	

	var extensionDuration = 1;	
	var delay = 1 / 60;
	var numScaleSteps = extensionDuration/delay;	
	var xScaleStep = nmXaxisLength/numScaleSteps;	

	var extendAxis = setInterval(function(){
				nmAxes.xLength = nmAxes.xLength + xScaleStep;
				animate(allObjects);
	}, delay);
}
*/

function testColorTween(){
	canvas.removeEventListener('click', step1);
	colorTween(pyr1, [0, 255, 0, 1.0], 500);
}

function testStep1(){
	canvas.removeEventListener('click', testStep1);
	var numCycles = 2;
	var halfCycleDur = 0.25;
	var numStepsPerCycle = 100;
	var transition1 = [{obj: pyr1, tgt: [0, 255, 0, 1.0]},
			   {obj: pyr2, tgt: [0, 255, 0, 1.0]},
			   {obj: spkrContainer, tgt: 1.0}
			  ];
	flash(transition1, numCycles, halfCycleDur, numStepsPerCycle);
	var totalDur = numCycles * 2 * halfCycleDur * 1000;
	var tmr4 = setTimeout( function(){ console.log('next step initiated') }, (totalDur) + 50);
	var tmr5 = setTimeout( function(){ canvas.addEventListener('click', testStep2); } , (totalDur) + 50);
}



function testStep2(){
	canvas.removeEventListener('click', testStep2);
	var duration = 2;
	d1 = new dataPoint(width/2, height/2, [185, 185, 185, 1.0], 45); // var keyword must be omitted here to make d1 a global variable
	var transition2 = [{obj:d1, tgt: [0, 255, 0, 1, 1.0]}];
	allObjects.push(d1);
	colorTweenMulti(transition2, duration, 100);
	var tmr6 = setTimeout( function(){ canvas.addEventListener('click', testStep3); } , (duration) + 50);
}



function testStep3(){
	canvas.removeEventListener('click', testStep3);
	var duration = 2;
	var transition3 = [{obj:d1, tgt: [255, 0, 0, 1.0]}];
	colorTweenMulti(transition3, duration, 100);
}

canvas.addEventListener('click', step0);

