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

// define constants for drawing pyramidals
var pyramidalHeight = 100;
var pyramidalBase = pyramidalHeight / Math.sin(Math.PI/3);
var apicalHeight = height/5;
var apicalWidth = 10;

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

// define constants for drawing thalamocortical axons
var tcHorizLength = 150;
var tcVertLength = boutonBase/2 + gap + pyramidalHeight + axonLength + boutonHeight + gap + 2*inhibitoryRadius + spineLength + inputBoxSize/2;
var filterBoxSize = 150;

// define constants for drawing axes
var ssAxisLength = width/4;
var axisThickness = 3;


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
		
		var intID = setInterval(function(){
			self.boutonHeight += step;
			self.draw();
			if(new Date().getTime() > start + duration * 1000){
				clearInterval(intID);
			}
		}, delay)	
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
		this.angle = angle/180 * Math.PI; 
		this.arrowHeadLength = this.widthTotal / 2 * Math.tan(Math.PI/3);
		this.arrowBodyLength = this.lengthTotal - this.arrowHeadLength;
		this.arrowBodyWidth = this.widthTotal / arrowHeadRatio;
		this.rgb = [185, 185, 185, 1.0];
	}

	// draws arrow with the origin in the center
	draw(){
		ctx.fillStyle = rgb2str(this.rgb);
		ctx.save();
		ctx.translate(this.ctrX, this.ctrY);		
		ctx.save();
		ctx.rotate(this.angle);
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

		ctx.restore();
	}

	plot(x, y, angle, color, duration){
		// x: x-coordinate of point relative to axis origins
		// y: y-coordinate of point relative to axis origins
		// angle: angle of arrow inscribed in point
		// color: rgba quadruple specifying final point color
		// duration: duration of plotting animation, in seconds
	

		var drawVertLineDelay = 0; // in milliseconds!
		var drawHorizLineDelay = 300; // in milliseconds!
		var drawPointDelay = 600; // in milliseconds!

		var drawVertLineDuration = 0.5; // in seconds!
		var drawHorizLineDuration = 0.5; // in seconds!
		var drawPointDuration = 0.5; // inseconds!
	
		var dataPointx = ssAxisLength * 0.1;
		var dataPointy = ssAxisLength * 0.9;

		var vertLine = new Rectangle(this.xOrig + x, this.yOrig, axisThickness, -this.yLength); vertLine.rgb = [0, 255, 0, 0.0]; allObjects.push(vertLine); 	
		var horizLine = new Rectangle(this.xOrig, this.yOrig - y, this.xLength, axisThickness); horizLine.rgb = [0, 255, 0, 0.0]; allObjects.push(horizLine); 	
		var dPoint = new dataPoint(x, -y, [0, 255, 0, 0.0], angle); this.points.push(dPoint); 	
	
		var vTransition = [{obj: vertLine, tgt: [0, 255, 0, 1.0]},
				   //{obj: horizLine, tgt: [0, 255, 0, 1.0]}
				  ];
	
		var hTransition = [//{obj: vertLine, tgt: [0, 255, 0, 1.0]},
				   {obj: horizLine, tgt: [0, 255, 0, 1.0]}
				  ];

		var dTransition = [{obj:dPoint, tgt:[0, 255, 0, 1.0]}];

		//colorTweenMulti(vTransition, drawVertLineDuration, 50);

		var drawVertLineTimeout = setTimeout(function(){
			colorTweenMulti(vTransition, drawVertLineDuration, 50);}
		, drawVertLineDelay);
		
		var drawHorizLineTimeout = setTimeout(function(){
			colorTweenMulti(hTransition, drawHorizLineDuration, 50);}
		, drawHorizLineDelay);	

		var drawPointTimeout = setTimeout(function(){
			colorTweenMulti(dTransition, drawPointDuration, 50);}
		, drawPointDelay);


		var vTransitionRev = [{obj: vertLine, tgt: [0, 255, 0, 0.0]}];
		var hTransitionRev = [{obj: horizLine, tgt: [0, 255, 0, 0.0]}];
		
		var eraseVertLineTimeout = setTimeout(function(){
			colorTweenMulti(vTransitionRev, drawVertLineDuration, 50);}
		, drawPointDelay + drawPointDuration + 600);
		
		var eraseHorizLineTimeout = setTimeout(function(){
			colorTweenMulti(hTransitionRev, drawHorizLineDuration, 50);}
		, drawPointDelay + drawPointDuration + 600);	


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
		});
	}	
}


function animate(allTheThings){
	ctx.clearRect(0, 0, width, height);	
	for(i = 0; i < allTheThings.length; i++){
		allTheThings[i].draw();
	}
}


function flash(transitions, numTimes, duration, numTimeSteps){
	// transitions: color/alpha transformations to make
	// numTimes: number of times to perform the color/alpha transformations and reverse them
	// duration: duration of each color/alpha transformation in seconds
	// numSteps: number of discrete animation steps per transformation
	
	var totalDuration = 2*duration*1000*numTimes; // each cycle consists of 2 transitions; each transition is `duration` seconds long; multiply by 1000 to get duration of each cycle in milliseconds; there are `numTimes` cycles over the course of the flash   
	
	console.log(" flash: transitions:");
	console.log(transitions);
	
	// record the original color/alpha state of the objects to be tweened:
	var originals = new Array(transitions.length);
	for (var m = 0; m < transitions.length; m++){
		if (transitions[m].obj.constructor.name != 'imgContainer'){
			originals[m] = transitions[m].obj.rgb.slice();
		} else if (transitions[m].obj.constructor.name == "imgContainer"){
			originals[m] = transitions[m].obj.alpha;
		}
	}

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

	console.log(" flash: reverseTransitions");
	console.log(reverseTransitions);

	var it = 0; // for debugging messages

	// tween back and forth for the number of specified times
	for(var n = 0; n < numTimes; n++){
		//console.log('iteration:')
		//console.log(n);
		// colorTweenMulti(transitions, duration, numTimeSteps);
		var tmr1 = setTimeout(function(){console.log('iteration '.concat(String(it), ' fwd:')); colorTweenMulti(transitions, duration, numTimeSteps);}, (n*2*duration*1000));
		console.log('delay = '.concat(String(2*n*duration*1000)));	
		//console.log('reverse');
		// var tmr = setTimeout(function(){colorTweenMulti(reverseTransitions, duration, numTimeSteps);}, duration*1000);
		var tmr2 = setTimeout(function(){console.log('iteration '.concat(String(it), ' reverse:'));colorTweenMulti(reverseTransitions, duration, numTimeSteps);it++}, (1000*duration * (2*n + 1)));
		console.log('delay = '.concat(String( 1000*duration*(2*n+1) )));
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
	}, totalDuration) 


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
	console.log('colorTweenMulti::transitions:');
	console.log(transitions);
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
				console.log('transition element #'.concat(String(p), ':'));
				console.log('	obj: '.concat(transitions[p].obj.constructor.name));
				
				if(transitions[p].obj.constructor.name != "imgContainer"){
					console.log('	starting color: '.concat(rgb2str(transitions[p].original.slice())));		
					console.log('	target color: '.concat(rgb2str(transitions[p].tgt.slice())));
					console.log('	step:'.concat(rgb2str(transitions[p].step.slice())));
					console.log('	final color (before manual correction): '.concat(rgb2str(transitions[p].obj.rgb.slice())));
					for (var k = 0; k <4; k++){
						transitions[p].obj.rgb[k] = transitions[p].tgt[k];
					}	
					console.log('	final color (after manual correction): '.concat(rgb2str(transitions[p].obj.rgb.slice())));
				}
				else if (transitions[p].obj.constructor.name == "imgContainer"){
					console.log('	starting alpha: '.concat(String(transitions[p].original)));		
					console.log('	target alpha: '.concat(String(transitions[p].tgt)));
					console.log('	step:'.concat(String(transitions[p].step)));
					console.log('	final alpha (before manual correction): '.concat(String(transitions[p].obj.alpha)));					
					transitions[p].obj.alpha = transitions[p].tgt				
					console.log('	final alpha (after manual correction): '.concat(String(transitions[p].obj.alpha)));
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
	console.log('colorTweenMulti::transitions:');
	console.log(transitions);	

	// initialize timer
	var tmr = new Timer;

	// make animationFrame request	
	window.requestAnimationFrame(function(timestamp){tmr.initialize();
							 transitions2 = computeColorStep(transitions, dur); 
							 colorTweenMultiStep(timestamp, transitions2, dur, tmr);});
}


function colorTweenMultiStep(timestamp, transitions, timer){
	// If the elapsed time is less than the frame period, do nothing:
	if( timestamp - timer.lastTime < framePeriod ){
		window.requestAnimationFrame(function(timeStamp2){colorTweenStep(timeStamp2, obj, tgt, speed, timer);});
		return;
	}

	timer.delta += timestamp - timer.lastTime;
	timer.lastTime = timestamp;

	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;
	
	// Evaluate if the tween is complete; if even one color of one object will not be at its target with one more step, then it's not complete
	var cont = 0;
	for(var oInd = 0; oInd < transitions.length; oInd++){
		if(objDoneTweening(transitions[oInd].obj, transitions[oInd].speed, transitions[oInd].tgt, timer)){
			cont = 1;
		}
	}

	// If the tween is not yet complete...
	if(cont == 1){
		console.log('multi-tween in progress');
		// ... check which objects in particular are not done tweening...
		for(var oInd = 0; oInd < transitions.length; oInd++){
			var currTransition = transitions[oInd];

			// ... and for any objects that are not done tweening...			
			if(objDoneTweening(currTransition.obj, currTransition.speed, currTransition.tgt, timer) == 0){
				
				// ... then if the object is a vector graphics object... 				
				if(currTransition.obj.constructor.name != 'imageContainer'){
					// ... then go through every color/alpha channel and update any that are not done tweening 					
					for(var k =0; k<4; k++){
						if(chDoneTweening(currTransition.obj.rgb[k], currTransition.speed[k], currTransition.tgt[k], timer) == 0){
							currTransition.obj.rgb[k] += currTransition.speed[k] * timeToRender; 
						}
					}
				
				// ... on the other hand, if the object is raster image object that only has an alpha property, then update the alpha.
				} else if (currTransition.constructor.name == 'imageContainer'){
					currTransition.obj.alpha += transitions[oInd].speed * timeToRender;
				}
			}
		}
	
		// render the changes and make a subsequent call to this function
		animate(allObjects);
		timer.delta -= Math.floor(timer.delta/framePeriod) * framePeriod;
		window.requestAnimationFrame(function(timestamp3){colorTweenMultiStep(timestamp3, transitions, timer)});

	// ... on the other hand, if the tween is complete, then manually clean up any errors
	} else{
		console.log('multi-tween complete');
		for(var oInd = 0; oInd < transitions.length; oInd++){
			var currTransition = transitions[oInd];			
			
			if(currTransition.obj.constructor.name != 'imageContainer'){
				for(var k = 0; k < 4; k++){
					currTransition.obj.rgb[k] = currTransition.tgt[k];
				}
			} else if(currTransition.obj.constructor.name != 'imageContainer'){
				currTransition.obj.alpha = currTransition.tgt;
			}
		}
	}
}


function computeColorStep(transitions, duration){
	for (var n = 0; n < transitions.length; n++){	
		// if the object to be tweened is a vector graphic object, compute the appropriate color steps 		
		if(transitions[n].obj.constructor.name != "imgContainer"){			
			// do this for each color channel			
			var speed = new Array(4);			
			for(var p = 0; p < 4; p++){
				step[p] = (transitions[n].tgt[p] - transitions[n].obj.rgb[p]) / duration;
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

	// compute color steps and stuff
	var speed = new Array(4);
	var initColor = obj.rgb.slice();

	for (var c = 0; c < 4; c++){
		speed[c] = (tgt[c] - initColor[c])/duration;
	}	

	// initialize timer
	tmr = new Timer;
	tmr.initialize();

	// make initial request upon next frame
	window.requestAnimationFrame(function(timeStamp){tmr.initialize(); colorTweenStep(timeStamp, obj, tgt, speed, tmr)});
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
	for (var c = 0; c < 4; c++){
		if( chDoneTweening(obj.rgb[c], speed[c], tgt[c], timer) == 0 ){
			cont = 1;
		};
	};

	// If the tween is not complete...	
	if(cont == 1){

		for(var d = 0; d < 4; d++){
		// ...only update colors that need updating; recall that the tween is incomplete if AT LEAST one color will not reach its target with one more step, meaning that the tween could be incomplete 			even if some of the colors are already going to reach their targets
			if( chDoneTweening(obj.rgb[d], speed[d], tgt[d], timer) == 0 ){  
				obj.rgb[d] += speed[d] * timeToRender;
				//console.log('adding color');
			};
		};

		animate(allObjects);
		timer.delta -= Math.floor(timer.delta/framePeriod) * framePeriod;		
		window.requestAnimationFrame(function(timeStamp3){colorTweenStep(timeStamp3, obj, tgt, speed, timer);});	
	// If the tween is complete, manually fix any errors	
	} else {
		for(var e = 0; e < 4; e++){
			obj.rgb[e] = tgt[e];
			//console.log('tween complete');
		}
	}
};


function objDoneTweening(obj, speed, tgt, delta){
	var timeToRender = Math.floor(delta/framePeriod) * framePeriod;	
	var done = 0;
	if(obj.constructor.name != 'imageContainer'){
		for(var k = 0; k < 4; k++){
			if (chDoneTweening(obj.rgb[k], speed[k], tgt[k], delta)){
				done = 1;
			}
		}
	} else if(obj.constructor.name == 'imageContainer'){
		if ( ( speed[k]>0 && obj.alpha[k]+speed[k]*timeToRender>tgt[k] ) || 
		     ( speed[k]<0 && obj.alpha[k]+speed[k]*timeToRender<tgt[k] ) ||
		       speed == 0){done = 1;}
	}
	return done;
}


function chDoneTweening(val, speed, tgt, timer){
	var timeToRender = Math.floor(timer.delta/framePeriod) * framePeriod;
	var done = 0;
	if( ( speed>0 && val+speed*timeToRender>=tgt ) ||
	    ( speed<0 && val+speed*timeToRender<=tgt ) ||
	      speed == 0){done = 1;}
	return done;
} 


function rgb2str(rgb){
	colorStr = colorBaseStr.concat(String(Math.floor(rgb[0])), ',', String(Math.floor(rgb[1])), ',', String(Math.floor(rgb[2])), ',', String(rgb[3]), ')');
	//console.log(colorStr);
	return colorStr;
}


// draw pyramidals
var pyr1 = new Pyramidal(width*0.125, height*0.4 + pyramidalHeight/2); pyr1.draw();
var pyr2 = new Pyramidal(pyr1.LLx + pyramidalBase + 20, pyr1.LLy); pyr2.draw();

// draw inhibitory neurons
var inh1 = new Inhibitory(pyr1.LLx + pyramidalBase/2, pyr1.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr2); inh1.draw(); //inh1.target(pyr2);
var inh2 = new Inhibitory(pyr2.LLx + pyramidalBase/2, pyr2.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr1); inh2.draw(); //inh2.target(pyr1);

// draw corticocorticals
var ccOrigin = pyr2.LLx + pyramidalBase + 200; // x-coordinate of where the cortico-coritcals originate from
var cc1 = new CC(pyr1.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr1.LLy - pyramidalHeight - apicalHeight * .75, ccOrigin); cc1.draw();
var cc2 = new CC(pyr2.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr2.LLy - pyramidalHeight - apicalHeight * .9, ccOrigin); cc2.draw();

// draw thalamocorticals
var tc1 = new TC(pyr1, 90, "left"); tc1.draw();
var tc2 = new TC(pyr2, 0, "right"); tc2.draw();

// render speaker png
var spkrContainer = new imgContainer(spkrSrc, ccOrigin + gap, (cc1.y + cc2.y)/2 - spkrSize/2, spkrSize, spkrSize, 0.5); //spkrContainer.draw();

// define and draw state space axes
var stateSpaceOriginX = width*0.45;
var stateSpaceOriginY = height*0.55 + ssAxisLength/2;
var stateSpaceAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, ssAxisLength, ssAxisLength); stateSpaceAxes.draw();

/* define neurometric curve axis (but don't draw it yet). 
It will start off in the same position as state space axes, and 
with no X-axis; it will later "slide" out from over the state space
axes, and the X axis will extend out of it
*/
var nmXaxisLength = width/4;
var nmAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, 0, ssAxisLength); // initialize x-origin to the same as that for the state space Axes
var nmAxesFinal = width * 0.8;  
var numAngles = 8;
var arrowsY = nmAxes.yOrig + 20;
var arrowsXstart = nmAxesFinal + 25;
var xArrowWidth = 9;
var xArrowLength = 30;
var xArrows = [];
for(var a = 0; a < numAngles; a++){
	angle = 90 - (a * (90/(numAngles-1)));
	var arrow = new Arrow(arrowsXstart + a*nmXaxisLength/numAngles, arrowsY, xArrowLength, xArrowWidth, angle);		
	arrow.rgb = [185, 185, 185, 0.0];		
	xArrows.push(arrow); 
}
console.log('xArrows');
console.log(xArrows);

// define and draw input box
pyr1MidBase = pyr1.LLx + pyramidalBase/2;
pyr2MidBase = pyr2.LLx + pyramidalBase/2;
midpoint = (pyr1MidBase + pyr2MidBase)/2;
var inputBox = {
	size: inputBoxSize,
	ULx: midpoint - inputBoxSize/2,
	ULy: pyr1.LLy - pyramidalHeight + tcVertLength - inputBoxSize/2, 
	rgb: [185, 185, 185, 1],

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
		ctx.restore();
	}
}
inputBox.draw();
var inputBoxCtrX = inputBox.ULx + inputBoxSize/2;
var inputBoxCtrY = inputBox.ULy + inputBoxSize/2;

// assemble objects into array
var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, tc1, tc2, spkrContainer, stateSpaceAxes, nmAxes, inputBox];
for(var a = 0; a < xArrows.length; a++){
	allObjects.push(xArrows[a]);
}


var transition2 = [
{obj: inh1, tgt: [255, 0, 0]},
];


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


function step1(){
	canvas.removeEventListener('click', step1);
	canvas.addEventListener('click', step2); 

	var duration = 500;

	// prepare arrow that will be drawn in input box
	var vertInput = new Arrow(inputBoxCtrX, inputBoxCtrY, inputBoxSize*0.6, inputBoxSize*0.33, 0);
	vertInput.rgb[3] = 0.0; // initialize alpha to 0 
	allObjects.push(vertInput);
	colorTween(vertInput, [0, 0, 0, 1.0], duration);
}

function step2(){
	canvas.removeEventListener('click', step2);
	canvas.addEventListener('click', step3alt);	
	var duration = 250;
	var latency = 100;
	colorTween(tc2, [0, 255, 0, 1.0], duration);	
	
	var activatePyr = setTimeout(function(){
		colorTween(pyr2, [0, 255, 0, 1.0], duration);
	}, latency);

}

function step3alt(){
	canvas.removeEventListener('click', step3alt);	
	var duration = 500;
	var transitions = [{obj: pyr2, tgt:[185, 185, 185, 1.0]},
			   {obj: tc2, tgt:[185, 185, 185, 1.0]},
			   {obj: inh2, tgt:[185, 185, 185, 1.0]}];	

	colorTweenMulti(transitions, duration);	
	

}

function step3(){
	canvas.removeEventListener('click', step3);
	canvas.addEventListener('click', step4);
	var duration = 250;
	console.log('step 3');
	colorTween(inh2, [255, 0, 0, 1.0], duration);	
}

var p1x = ssAxisLength * 0.1;
var p1y = ssAxisLength * 0.9;
var vertGridLine = new Rectangle(stateSpaceAxes.xOrig + p1x, stateSpaceAxes.yOrig, axisThickness, -stateSpaceAxes.yLength); vertGridLine.rgb = [0, 255, 0, 0.0]; 
var horizGridLine = new Rectangle(stateSpaceAxes.xOrig + axisThickness, stateSpaceAxes.yOrig - p1y, stateSpaceAxes.xLength - axisThickness, axisThickness); horizGridLine.rgb = [0, 255, 0, 0.0]; 
var p = new dataPoint(stateSpaceAxes.xOrig + p1x, stateSpaceAxes.yOrig - p1y, [0, 255, 0, 0.0], 0); 

function step4(){
	canvas.removeEventListener('click', step4);
	canvas.addEventListener('click', step5);

	// add these objects to allObjects
	allObjects.push(vertGridLine);
	allObjects.push(horizGridLine);
	allObjects.push(p);

	var duration = 500;
	colorTween(vertGridLine, [0, 255, 0, 1.0], duration);	
}

function step5(){
	canvas.removeEventListener('click', step5);
	canvas.addEventListener('click', step6);
	
	// line variables
	var duration = 500;
	
	// datapoint variables
	var latency1 = 250; // delay between when the horizontal line starts getting drawn and when the point starts getting drawn, in milliseconds	
	var latency2 = 250; // delay between when the point starts getting drawn and when the grid lines start being erased, in milliseconds	

	// render the line	
	colorTween(horizGridLine, [0, 255, 0, 1.0], duration);

	// after some delay, render the point
	var drawPoint = setTimeout(function(){
		console.log('draw point');
		colorTween(p, [0, 255, 0, 1.0], duration);
	}, latency1);

	// now remove the grid lines
	var rlTransition = [{obj: vertGridLine, tgt: [0, 255, 0, 0.0]},
			    {obj: horizGridLine, tgt: [0, 255, 0, 0.0]}];
	var removeLines = setTimeout(function(){
		colorTweenMulti(rlTransition, duration);
	}, latency1 + latency2);
}

/*
function step6(){
	canvas.removeEventListener('click', step6);
	canvas.addEventListener('click', step7);	
	
	console.log('allObjects');
	console.log(allObjects);

	console.log('xArrows');
	console.log(xArrows);

	// after the point is rendered, remove it from allObjects and make it a child of stateSpaceAxes
	//allObjects.pop();	
	p.ctrX = p1x; // make the coordinates relative to the origin of stateSpaceAxes
	p.ctrY = -p1y; // make the coordinates relative to the origin of stateSpaceAxes
	stateSpaceAxes.points.push(p);

	// also pop out those grid lines objects, which we don't need anymore	
	//allObjects.pop(); 
	//allObjects.pop();
}
*/

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
	
	// variables controlling timing of translation:	
	var distance = nmAxesFinal - nmAxes.xOrig;	
	var slideDuration = 1;
	var vel = distance / (slideDuration * 1000);  
	
	// variables controlling timing of x-scaling:
	var scaleDuration = 0.25;
	var numScaleSteps = 50;	
	var scaleTimeStep = (scaleDuration/numScaleSteps) * 1000;
	var scaleStep = nmXaxisLength/numScaleSteps;

	// variables needed for plotting arrows along x-axis:
	var timePerArrow = 0.5; // time it takes to draw each individual arrow;
	var arrowDurTotal = 1; // time between beginning to draw first arrow and beginning to draw last arrow
	
	// local functions needed for animation:	
	function initializeLastFrame(timeStamp){
		lastFrameTimeMs = timeStamp;
	};

	function updateXorig(delta){
		nmAxes.xOrig += vel * delta;		
		animate(allObjects);
	};

	function translateNM(timeStamp){
	
		var delta = timeStamp - lastFrameTimeMs;
		lastFrameTimeMs = timeStamp;
		updateXorig(delta);		

		if(nmAxes.xOrig + vel * delta < nmAxesFinal){
			window.requestAnimationFrame(translateNM);
		} else { // Once the translation is done...
			console.log('finish translation');			
	
			// ...clean up any errors in the tweening
			nmAxes.xOrig = nmAxesFinal;
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

	window.requestAnimationFrame(initializeLastFrame);
	window.requestAnimationFrame(translateNM);
}

function step7(){
	canvas.removeEventListener('click', step7);
	console.log('stateSpaceAxes.points:');
	console.log(stateSpaceAxes.points);
	nmAxes.plot(xArrows[7].ctrX - nmAxes.xOrig, -stateSpaceAxes.points[0].ctrY, 0, [0, 255, 0, 1.0], 2);	
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

canvas.addEventListener('click', step1);

