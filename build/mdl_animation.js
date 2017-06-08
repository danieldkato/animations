// get basic canvas variables
var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
var ctx = canvas.getContext('2d');

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
		ctx.translate(0, this.arrowLengthTotal/2 - this.arrowBodyLength);
		ctx.rotate(this.angle);
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
	}

	draw(){
		ctx.save();
		ctx.translate(this.xOrig, this.yOrig);
		ctx.fillRect(0, 0, this.xLength, axisThickness);
		ctx.fillRect(0, 0, axisThickness, -this.yLength);	
		ctx.restore();
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


function colorTweenMulti(transitions, dur, numTimeSteps){
	// transitions: object array describing color/alpha transitions to make
	// dur: total duration of transition in seconds
	// numTimeSteps: number of discrete time steps into which to divide the animation

	var delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 

	// for each object to be tweened, compute the appropriate color or alpha steps
	var transitions = computeColorStep(transitions, numTimeSteps);
	console.log('Transitions:');
	console.log(transitions);
	

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

		if (new Date().getTime() > start + dur * 1000){
			clearInterval(intId);
		}

	}, delay);
}


function computeColorStep(transitions, numTimeSteps){
	for (var n = 0; n < transitions.length; n++){	
		// if the object to be tweened is a vector graphic object, compute the appropriate color steps 		
		if(transitions[n].obj.constructor.name != "imgContainer"){			
			// do this for each color channel			
			for(var p = 0; p < 4; p++){
				step[p] = (transitions[n].tgt[p] - transitions[n].obj.rgb[p]) / numTimeSteps;
			}
			transitions[n].step = step.slice();
		}
		// if the object to be tweened is an image container, compute the appropriate alpha step
		else if(transitions[n].obj.constructor.name == "imgContainer"){
			transitions[n].step = (transitions[n].tgt - transitions[n].obj.alpha) / numTimeSteps
		}
	//console.log('obj'.concat(String(n), ':'));
	console.log(transitions[n].obj.rgb.slice());	
	//console.log('step:');
	console.log(transitions[n].step.slice());	
	}
	return transitions;
}


function rgb2str(rgb){
	colorStr = colorBaseStr.concat(String(Math.floor(rgb[0])), ',', String(Math.floor(rgb[1])), ',', String(Math.floor(rgb[2])), ',', String(rgb[3]), ')');
	//console.log(colorStr);
	return colorStr;
}



// draw pyramidals
var pyr1 = new Pyramidal(width/5, height/3 + pyramidalHeight/2); pyr1.draw();
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
var stateSpaceAxes = new Axes(width/2, height/2 + ssAxisLength/2, ssAxisLength, ssAxisLength); stateSpaceAxes.draw();

/*
var stateSpaceAxes = {
,
	axisThickness: 3,
	originX: width/2,
	originY: height/2 + this.axisLength/2,
	
	draw: function(){
		ctx.save();
		ctx.translate(this.originX, this.originY);
		ctx.fillRect(0, 0, this.axisLength, this.axisThickness);
		ctx.fillRect(0, 0, this.axisThickness, -this.axisLength);
		ctx.restore();
	}
	
}
*/

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
var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, tc1, tc2, spkrContainer, stateSpaceAxes, inputBox];


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
	canvas.removeEventListener('click', testStep1);
	var duration = 2;

	// prepare arrow that will be drawn in input box
	var vertInput = new Arrow(inputBoxCtrX, inputBoxCtrY, inputBoxSize*0.6, inputBoxSize*0.33, 0);
	vertInput.rgb = [185, 185, 185, 0.0]; // initialize alpha to 0 
	//vertInput.draw();	
	allObjects.push(vertInput);

	// define the transition structure
	var transition4 = [{obj: pyr1, tgt: [0, 255, 0, 1.0]},
			   {obj: inh1, tgt: [255, 0, 0, 1.0]},
			   //{obj: vertInput, tgt: [185, 185, 185, 1.0]}
			  ];
	colorTweenMulti(transition4, 2, 100);	
	
	var tmr1 = setTimeout( function(){ canvas.addEventListener('click', step2); } , (duration) + 50);
}


function step2(){}


canvas.addEventListener('click', step1);