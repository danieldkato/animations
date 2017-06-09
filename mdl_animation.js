
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
var stateSpaceOriginX = width/2;
var stateSpaceOriginY = height/2 + ssAxisLength/2;
var stateSpaceAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, ssAxisLength, ssAxisLength); stateSpaceAxes.draw();

/* define neurometric curve axis (but don't draw it yet). 
It will start off in the same position as state space axes, and 
with no X-axis; it will later "slide" out from over the state space
axes, and the X axis will extend out of it
*/
var nmAxes = new Axes(stateSpaceOriginX, stateSpaceOriginY, 0, ssAxisLength); //  

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
var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, tc1, tc2, spkrContainer, stateSpaceAxes, nmAxes, inputBox];


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
	var duration = 0.25;

	// prepare arrow that will be drawn in input box
	var vertInput = new Arrow(inputBoxCtrX, inputBoxCtrY, inputBoxSize*0.6, inputBoxSize*0.33, 0);
	vertInput.rgb = [185, 185, 185, 0.0]; // initialize alpha to 0 
	//vertInput.draw();	
	allObjects.push(vertInput);

	// define the transition structure
	var transition4 = [{obj: pyr2, tgt: [0, 255, 0, 1.0]},
			   {obj: tc2, tgt: [0, 255, 0, 1.0]},
			   {obj: inh2, tgt: [255, 0, 0, 1.0]},
			   {obj: vertInput, tgt: [185, 185, 185, 1.0]}
			  ];
	colorTweenMulti(transition4, duration, 50);	
	
	var tmr1 = setTimeout( function(){ canvas.addEventListener('click', step2); } , (duration) + 50);
}


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


// define some ancillary variables and functions that will be used in step 4 (maybe these should go in AnimationClasses.js)	
function initializeLastFrame(timeStamp){lastFrameTimeMs = timeStamp;};

function update(delta){
	nmAxes.xOrig =  nmAxes.xOrig + vel * delta;		
	animate(allObjects);
}

function step(timeStamp){
	
	var delta = timeStamp - lastFrameTimeMs;
	lastFrameTimeMs = timeStamp;
	update(delta);		

	if(nmAxes.xOrig + vel < tgtX){
		window.requestAnimationFrame(step);
	};
};


function step4(){
	canvas.removeEventListener('click', step4);
	nmAxes.draw();

	var lastFrameTimeMs = 0;
	var tgtX = width * 0.8;
	var distance = tgtX - nmAxes.xOrig;	
	var slideDuration = 2;
	var vel = distance / (slideDuration * 1000);  
	
	window.requestAnimationFrame(initializeLastFrame);
	window.requestAnimationFrame(step);	
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

canvas.addEventListener('click', step1);
