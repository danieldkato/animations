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
	var nmPointPre = new dataPoint(dPointXpre, dPointYpre, lime.slice(), xArrows[q].angle); //nmPointPre.draw();
	nmPointPre.rgb[3] = 0.0;

	var dPointXpost = xArrows[q].ctrX;
	var dPointYpost = stateSpaceAxes.yOrig - postPairFinalPositions[q][1];
	var nmPointPost = new dataPoint(dPointXpost, dPointYpost, [185, 65, 245, 1.0], xArrows[q].angle); //nmPointPost.draw();		
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

