
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

