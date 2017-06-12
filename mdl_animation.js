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
var xArrows = new Array(8);
for(var a = 0; a < numAngles; a++){
	angle = 90 - (a * (90/(numAngles-1)));
	var arrow = new Arrow(arrowsXstart + a*nmXaxisLength/numAngles, arrowsY, xArrowLength, xArrowWidth, angle);		
	arrow.rgb = [185, 185, 185, 0.0];		
	xArrows[a] = arrow; 
}
console.log('xArrows');
console.log(xArrows);


// define all the points that will appear in state space axes (but don't render them yet)
stateSpaceAxes.draw();

// first, for the unpaired stimuli
var stateSpacePoints = new Array(xArrows.length);
for (var p = 0; p < xArrows.length; p++){
	var dPointX = 0.1*stateSpaceAxes.xLength + 0.8*stateSpaceAxes.xLength*Math.sin( Math.PI*(xArrows[p].angle/180) );
	var dPointY = 0.1*stateSpaceAxes.yLength + 0.8*stateSpaceAxes.yLength*Math.cos( Math.PI*(xArrows[p].angle/180) );

	var ssPoint = new dataPoint(stateSpaceAxes.xOrig + dPointX, stateSpaceAxes.yOrig - dPointY, angle2colorN1(xArrows[p].angle), xArrows[p].angle);
	ssPoint.rgb[3] = 0.0 // initialize to be invisible 
	stateSpacePoints[p] = ssPoint;
}

console.log('stateSpacePoints');
console.log(stateSpacePoints);
// define all the points that will appear on the psychometric axes (but don't render them yet)
// first, for the unpaired stimuli
var psychometricPoints = new Array(xArrows.length);
for (var q = 0; q < xArrows.length; q++){
	var dPointX = xArrows[q].ctrX;
	console.log('ssPoint:');
	console.log(stateSpacePoints[q]);
	var dPointY = stateSpacePoints[q].ctrY;

	var nmPoint = new dataPoint(dPointX, dPointY, angle2colorN1(xArrows[q].angle), xArrows[q].angle);
	nmPoint.rgb[3] = 0.0; 	
	psychometricPoints[q] = nmPoint;
	
}



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
var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, cc3, cc4, tc1, tc2, spkrContainer, inputBox, inptArrow];
for(var a = 0; a < xArrows.length; a++){
	allObjects.push(xArrows[a]);
}

for(var i = 0; i < psychometricPoints.length; i++){
	allObjects.push(psychometricPoints[i]);
}

var transition2 = [
{obj: inh1, tgt: [255, 0, 0]},
];















// show vertical input
function step0(){
	canvas.removeEventListener('click', step0);
	canvas.addEventListener('click', step1);
	console.log('step 0');
	var step0dur = 300;
	colorTween(inptArrow, inptTxtColor, step0dur); 
}

// activate tc1, pyr1, and inh1
function step1(){
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
	canvas.removeEventListener('click', step4);
	canvas.addEventListener('click', step5);

	allObjects.push(stateSpaceAxes);
	allObjects.push(vertGradScale);
	allObjects.push(horizGradScale);
	animate(allObjects);
}



// present vertical stimuls again
function step5(){
	canvas.removeEventListener('click', step5);
	canvas.addEventListener('click', step6);

	inptArrow.angle = 0	;
	var step5dur = 200;	
	var transitions1 = [{obj: tc1, tgt: lime},
			    {obj: pyr1, tgt: lime},
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
	canvas.removeEventListener('click', step6);
	canvas.addEventListener('click', step7);

	// push the data point we're going to plot	
	allObjects.push(stateSpacePoints[7]);

	// add these objects to allObjects
	allObjects.push(vertGridLine);
	allObjects.push(horizGridLine);
	allObjects.push(p);

	var s6dur = 250;
	colorTween(vertGridLine, inptTxtColor, s6dur);	
}


// plot the horizontal gridline and the point, then erase the gridlines
function step7(){
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
	tgt = stateSpacePoints[7].rgb.slice();	// alpha of point initially set to 0; want to set tgt that is the same but alpha = 1
	tgt[3] = 1.0; 
	var drawPoint = setTimeout(function(){
		colorTween(stateSpacePoints[7], tgt, duration);
	}, latency1);

	// now remove the grid lines
	var rlTransition = [{obj: vertGridLine, tgt: [100, 100, 100, 0.0]},
			    {obj: horizGridLine, tgt: [100, 100, 100, 0.0]}];
	var removeLines = setTimeout(function(){
		colorTweenMulti(rlTransition, duration);
	}, latency1 + latency2);	
}


// have the psychometric axes slide out from the state space
function step8(){
	canvas.removeEventListener('click', step8);
	canvas.addEventListener('click', step9);

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


// plot response to vertical line on psychometric axes with horizontal line connecting to state space
function step9(){
	canvas.removeEventListener('click', step9);
	canvas.addEventListener('click', step10);

	var tmpGridlineDuration = 500;

	var tempGridLineHoriz = new Rectangle(stateSpaceAxes.xOrig, psychometricPoints[7].ctrY, (nmAxes.xOrig - stateSpaceAxes.xOrig) + nmAxes.xLength, axisThickness);
	var tempGridLineVert = new Rectangle(psychometricPoints[7].ctrX, nmAxes.yOrig, axisThickness, -nmAxes.yLength);
	tempGridLineHoriz.rgb = [100, 100, 100, 0.0];
	tempGridLineVert.rgb = [100, 100, 100, 0.0];		
	allObjects.push(tempGridLineHoriz);	
	allObjects.push(tempGridLineVert);

	var drawGLtrans = [{obj: tempGridLineHoriz, tgt: inptTxtColor},
			  {obj: tempGridLineVert, tgt: inptTxtColor}] 
	colorTweenMulti(drawGLtrans, tmpGridlineDuration);	
		
	var tgt = psychometricPoints[7].rgb.slice();
	tgt[3] = 1.0;	
	allObjects.push(psychometricPoints[7]);
	var plotPoint = setTimeout(function(){colorTween(psychometricPoints[7], tgt, tmpGridlineDuration)}, tmpGridlineDuration);
	
	var eraseGLtrans = [{obj: tempGridLineHoriz, tgt: [100, 100, 100, 0.0]},
			  {obj: tempGridLineVert, tgt: [100, 100, 100, 0.0]}] 
	var eraseTempGridLine = setTimeout(function(){colorTweenMulti(eraseGLtrans, tmpGridlineDuration);}, tmpGridlineDuration);
}


// show response to horizontal stimulus
function step10(){
	allObjects.pop(); // pop temporary pan-plot gridline from last step
	allObjects.pop();

	canvas.removeEventListener('click', step10);
	canvas.addEventListener('click', step11);

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
function step11(){
	canvas.removeEventListener('click', step11);
	canvas.addEventListener('click', step12);

	var tempLineDuration = 500;

	var dPointX = stateSpaceAxes.xLength * 0.9;
	var dPointY = stateSpaceAxes.yLength * 0.1;
	

	var tempGridLine = new Rectangle(stateSpaceAxes.xOrig, stateSpaceAxes.yOrig - dPointY, (nmAxes.xOrig - stateSpaceAxes.xOrig) + nmAxes.xLength, axisThickness);
	tempGridLine.rgb = [100, 100, 100, 0.0];	
	allObjects.push(tempGridLine);	

	stateSpaceAxes.plot(dPointX, dPointY, 90, blGrey, tempLineDuration);
	colorTween(tempGridLine, inptTxtColor, tempLineDuration);
	var eraseTempGridLine = setTimeout(function(){colorTween(tempGridLine, [100, 100, 100, 0.0], tempLineDuration)}, tempLineDuration);
	var plotNM = setTimeout(function(){nmAxes.plot(xArrows[0].ctrX - nmAxes.xOrig, dPointY, 90, blGrey, tempLineDuration)}, tempLineDuration + 25);
}


// deactivate pyr2, etc.
function step12(){
	canvas.removeEventListener('click', step12);
	canvas.addEventListener('click', step13);
	
	var dur = 500;
	var transitions = [{obj: tc2, tgt: blGrey},
			   {obj: pyr2, tgt: blGrey},
			   {obj: inh2, tgt: blGrey},
			   {obj: inptArrow, tgt: [100, 100, 100, 0.0]}];
	colorTweenMulti(transitions, dur);
}


// present an intermediate stimulus
function step13(){
	canvas.removeEventListener('click', step13);
	canvas.addEventListener('click', step14);
	
	var dur = 500;
	var angle = xArrows[4].angle; // remember, this is angle away from vertical 
	inptArrow.angle = xArrows[4].angle;
	
	var transitions = [{obj: pyr1, tgt: frac2color(0.85, lime)},
			   {obj: inh1, tgt: frac2color(0.85, red)},
			   {obj: tc1, tgt: frac2color(0.85, lime)},
			   {obj: pyr2, tgt: frac2color(0.15, lime)},
			   {obj: tc2, tgt: frac2color(0.15, lime)},
			   {obj: inh2, tgt: frac2color(0.15, red)},
			   {obj: inptArrow, tgt: inptTxtColor}];

	colorTweenMulti(transitions, 500);	
	//var dur = ;

}


function step14(){
	canvas.removeEventListener('click', step14);
	canvas.addEventListener('click', step15);

	var interval = 1000;	
	var idx = 0;
		

	var doPlots = setInterval(function(){
		if (idx > xArrows.length){
			clearInterval(doPlots);
		}
		doublePlot(idx);
		idx++;
	}, interval)

}


function step15(){
}

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

