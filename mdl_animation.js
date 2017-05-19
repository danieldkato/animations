var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
var ctx = canvas.getContext('2d');

var colorBaseStr = 'rgb(';
var step = new Array(3);

var pyramidalHeight = 100;
var pyramidalBase = pyramidalHeight / Math.sin(Math.PI/3);

var apicalHeight = height/5;
var apicalWidth = 10;

var axonLength = height/5;
var axonWidth = apicalWidth;
var boutonHeight = 25;
var boutonBase = boutonHeight / Math.sin(Math.PI/3);
var fudge = boutonHeight * axonWidth/boutonBase; // this is to make sure that the boutons overlap with the axons properly

var gap = 5; // synaptic gap
var inhibitoryRadius = 40;
var spineWidth = apicalWidth;
var spineLength = 20;
var inhibSynLength = 30;
var inhibSynWidth = spineWidth;

var tcHorizLength = 150;
var filterBoxSize = 150;

var dataPointRadius = 10; 

//var arrowWidth = filterBoxSize * 0.33;
//var arrowLength = filterBoxSize * 0.6;
//var arrowHeadBase = arrowHeadRatio * arrowWidth;
//var arrowHeadLength = arrowWidth / 2 * Math.tan(Math.PI/3);
//var arrowBodyLength = arrowLength - arrowHeadLength;
var arrowHeadRatio = 2; // ratio of width of arrowhead to width of arrow body
//var arrowBodyWidth = arrowWidth / arrowHeadRatio;

var tcVertLength = boutonBase/2 + gap + pyramidalHeight + axonLength + boutonHeight + gap + 2*inhibitoryRadius + spineLength;

var spkrSize = 100;
//spkrSrc = "/home/dan/Documents/animations/speakers.png"
spkrSrc = "C:/Users/Dank/Documents/presentations/quals/speakers.png"

class Pyramidal {
	// x: x-coordinate of lower-left corner of soma
	// y: y-coordinate of lower-left corner of soma
	constructor(x, y){
		this.LLx = x;
		this.LLy = y;
		this.rgb = [185, 185, 185];
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
		this.rgb = [185, 185, 185];
		
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
		//tgtSpnAngle = ;
		ctx.rotate(-1 * this.tgtSpnAngle);
		//ctx.translate(0, -spineWidth/2);
		//length = .85 * Math.sqrt( Math.pow(pyr.LLx + pyramidalBase/2 - this.ctrX, 2) + Math.pow(pyr.LLy - this.ctrY, 2) );
		ctx.fillRect(0, 0, this.tgtSpnLength, spineWidth);
		ctx.fillRect(this.tgtSpnLength-inhibSynWidth/2, axonWidth/2 - inhibSynLength/2, inhibSynWidth, inhibSynLength);
		ctx.rotate(this.tgtSpnAngle - 0.75 * Math.PI );
		ctx.fillRect(0, -spineWidth/2, this.r + spineLength, spineWidth);
		ctx.restore();
		//console.log(Math.pow(2,2));
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
		this.rgb = [185, 185, 185]; 	
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

	wrapper(){
		this.rgb = [0, 255, 0];
		this.draw();
	}

	// duration: duration of the transformation in seconds
	potentiate(scale, duration, numTimeSteps){
		
		var self = this;
		var delay = duration/numTimeSteps * 1000;
		var tgtHeight = this.boutonHeight * scale;
		var step = (tgtHeight - this.boutonHeight) / numTimeSteps;

		var start = new Date().getTime(); // start time in milliseconds (UNIX time)
		
		//self.wrapper();

		//this.boutonHeight = this.boutonHeight * scale;
		//this.draw();
		
		
		var intID = setInterval(function(){
			
			self.boutonHeight += step;
			//self.wrapper();
			self.draw();

			if(new Date().getTime() > start + duration * 1000){
				clearInterval(intID);
			}
		}, delay)	
	}
}

class Arrow {
	constructor(length, width, angle){
		// length: total length of arrow (including arrowhead)
		// width: total width of arrow (including arrowhead)
		// angle: angle of arrow clockwise from vertical, in degrees
		this.lengthTotal = length; 
		this.widthTotal = width;  
		this.angle = angle/180 * Math.PI; 
		this.arrowHeadLength = this.widthTotal / 2 * Math.tan(Math.PI/3);
		this.arrowBodyLength = this.lengthTotal - this.arrowHeadLength;
		this.arrowBodyWidth = this.widthTotal / arrowHeadRatio;
		this.color = [185, 185, 185];
	}

	// draws arrow with the origin in the center
	draw(){
		ctx.fillStyle = rgb2str(this.color);
		ctx.save();
		ctx.translate(0, this.arrowLengthTotal/2 - this.arrowBodyLength);
		ctx.rotate(this.angle);
		ctx.fillRect(-this.arrowBodyWidth/2, this.lengthTotal/2 - this.arrowBodyLength - 1, this.arrowBodyWidth, this.arrowBodyLength);
		ctx.beginPath();
		ctx.moveTo(-this.widthTotal/2, this.lengthTotal/2 - this.arrowBodyLength);
		ctx.lineTo(this.widthTotal/2, this.lengthTotal/2 - this.arrowBodyLength);
		ctx.lineTo(0, -this.lengthTotal/2);
		ctx.fill();
		console.log('arrow drawn');
		ctx.restore();

	}
}


class TC {
	// pyr: identity of pyramidal cell targeted by TC
	// prferredStim: orentation of preferred direction stimulus
	// lr: whether the axon should target the left side or the right side of the targeted pyramidal cell
	constructor(pyr, preferredStim, lr){
		this.pyr = pyr;
		this.rgb = [185, 185, 185];
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
		this.arrow = new Arrow(this.arrowLengthTotal, this.arrowWidthTotal, preferredStim);
	}

	draw(){
		ctx.fillStyle = rgb2str(this.rgb[0], this.rgb[1], this.rgb[2]);
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
		ctx.strokeStyle = "black";
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
		
		/*
		// draw continuation of vertical branch
		ctx.fillRect(tcHorizLength, tcVertLength - axonWidth/2 + filterBoxSize, axonWidth, tcVertLength);
		*/

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
		this.arrow = new Arrow(2 * dataPointRadius * 0.6, 2 * dataPointRadius * 0.33, angle);
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
		//this.draw();
		var self = this;
		this.img.onload = function(){self.draw();};	
		this.img.src = src;
	}

	draw(){
		var oldAlpha = ctx.globalAlpha;
		console.log('oldAlpha');
		console.log(oldAlpha);
		ctx.globalAlpha = this.alpha;
		console.log('globalAlpha before reverting');
		console.log(ctx.globalAlpha);
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
		console.log('value of oldAlpha after changing ctx.globalAlpha');
		console.log(oldAlpha);		
		ctx.globalAlpha = oldAlpha;
	}
}

class Speaker{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.alpha = alpha;
	}
}

var pyr1 = new Pyramidal(width/5, height/3 + pyramidalHeight/2); pyr1.draw();
var pyr2 = new Pyramidal(pyr1.LLx + pyramidalBase + 20, pyr1.LLy); pyr2.draw();
var inh1 = new Inhibitory(pyr1.LLx + pyramidalBase/2, pyr1.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr2); inh1.draw(); //inh1.target(pyr2);
var inh2 = new Inhibitory(pyr2.LLx + pyramidalBase/2, pyr2.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr1); inh2.draw(); //inh2.target(pyr1);

var ccOrigin = pyr2.LLx + pyramidalBase + 200; // x-coordinate of where the cortico-coritcals originate from
var cc1 = new CC(pyr1.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr1.LLy - pyramidalHeight - apicalHeight * .75, ccOrigin); cc1.draw();
var cc2 = new CC(pyr2.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr2.LLy - pyramidalHeight - apicalHeight * .9, ccOrigin); cc2.draw();

var tc1 = new TC(pyr1, 90, "left"); tc1.draw();
var tc2 = new TC(pyr2, 0, "right"); tc2.draw();

//spkr.src = "/home/dan/Documents/animations/speakers.png"
//var spkrContainer = new imgContainer(spkrSrc, ccOrigin + gap, (cc1.y + cc2.y)/2 - spkrSize/2, spkrSize, spkrSize, 1.0); spkrContainer.draw();
//spkr.onload = function(){spkrContainer.draw()};

/*
var spkr = new Image();
spkr.onload = function(){ctx.drawImage(spkr, 100, 100, spkrSize, spkrSize); console.log('image loaded')};
spkr.src = spkrSrc; 
*/

var spkrContainer = new imgContainer(spkrSrc, ccOrigin + gap, (cc1.y + cc2.y)/2 - spkrSize/2, spkrSize, spkrSize, 0.5); //spkrContainer.draw();

var red = [255, 0, 0];
var testDataPoint = new dataPoint(500, 500, red, 45); testDataPoint.draw();

var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, tc1, tc2, spkrContainer, testDataPoint];

function animate(allTheThings){
	for(i = 0; i < allTheThings.length; i++){
		allTheThings[i].draw();
	}
}

function flash(transitions, numTimes, duration, numTimeSteps){
	// transitions: color/alpha transformations to make
	// numTimes: number of times to perform the color/alpha transformations and reverse them
	// duration: duration of each color/alpha transformation in seconds
	// numSteps: number of discrete animation steps per transformation

	// create an object array representing the reverse transition:
	
	console.log(" flash: transitions:");
	console.log(transitions);
	
	var reverseTransitions = JSON.parse(JSON.stringify(transitions)); 
	/* Simple assignment ("=") of an array in Javascript does NOT create a copy of that 
	array - it creates a reference!! I.e., if you set 
	
		var reverseTranstion = transitions
		
	then any changes you make to reversetransitions will also be made to transitions! 
	Moreover the common methods for copying arrays - slice() and concat() - do NOT 
	work when the elements of the array are objects! This JSON.parse(JSON.stringify()) 
	trick appears to be necessary */ 
	for (var t = 0; t < transitions.length; t++){
		if (transitions[t].obj.constructor.name != "imgContainer"){
			reverseTransitions[t].tgt = transitions[t].obj.rgb;
			console.log("reverse transition rgb")
			console.log(reverseTransitions[t].tgt);
		} else if (transitions[t].obj.constructor.name == "imgContainer"){
			reverseTransitions[t].tgt = transitions[t].obj.alpha;
		}
	}

	console.log(" flash: reverseTransitions:");
	console.log(reverseTransitions);

	// tween back and forth for the number of specified times
	/*
	for(var n = 0; n < numTimes; n++){
		colorTweenMulti(transitions, duration, numTimeSteps);
		colorTweenMulti(reverseTransitions, duration, numTimeSteps);
	}
	*/
}

function colorTweenMulti(transitions, dur, numTimeSteps){
	// transitions: object array describing color/alpha transitions to make
	// dur: total duration of transition in seconds
	// numTimeSteps: number of discrete time steps into which to divide the animation

	var delay = dur/numTimeSteps * 1000; // delay between re-paints, in milliseconds 

	// for each object to be tweened, compute the appropriate color or alpha steps
	var transitions = computeColorStep(transitions, numTimeSteps);

	// over the course of tween period, update properties of all objects to be tweened
	var start = new Date().getTime()
	var now = start;
	var intId = setInterval(function(){

		for (var m = 0; m < transitions.length; m++){	

			// if the object to tween is a vector graphics object, update its rgb triple		
			if (transitions[m].obj.constructor.name != "imgContainer"){
				for (var k = 0; k <3; k++){
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

		ctx.clearRect(0, 0, width, height);
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
			for(var p = 0; p < 3; p++){
				step[p] = (transitions[n].tgt[p] - transitions[n].obj.rgb[p]) / numTimeSteps;
			}
			transitions[n].step = step;
			console.log('color step:');
			console.log(transitions[n].step);
		}
		// if the object to be tweened is an image container, compute the appropriate alpha step
		else if(transitions[n].obj.constructor.name == "imgContainer"){
			transitions[n].step = (transitions[n].tgt - transitions[n].obj.alpha) / numTimeSteps;
			console.log('alpha step:');
			console.log(transitions[n].step);
		}
	}
	return transitions;
}

function rgb2str(rgb){
	colorStr = colorBaseStr.concat(String(Math.floor(rgb[0])), ',', String(Math.floor(rgb[1])), ',', String(Math.floor(rgb[2])), ')');
	console.log(colorStr);
	return colorStr;
}

var transition1 = [
{obj: pyr1, tgt: [0, 255, 0]},
{obj: pyr2, tgt: [0, 255, 0]},
{obj: spkrContainer, tgt: 1.0}
];

canvas.addEventListener('click', function respond(e){

	console.log('transition1');
	console.log(transition1);


	//colorTweenMulti(transition1, 5, 100);
	flash(transition1, 1, 3, 100);
});


/*
canvas.addEventListener('click', function respond(e){
	cc1.potentiate(1.75,1,100);
});
*/