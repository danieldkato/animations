

var pyr1 = new Pyramidal(width/5, height/3 + pyramidalHeight/2); pyr1.draw();
var pyr2 = new Pyramidal(pyr1.LLx + pyramidalBase + 20, pyr1.LLy); pyr2.draw();
var inh1 = new Inhibitory(pyr1.LLx + pyramidalBase/2, pyr1.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr2); inh1.draw(); //inh1.target(pyr2);
var inh2 = new Inhibitory(pyr2.LLx + pyramidalBase/2, pyr2.LLy + axonLength - fudge + boutonHeight + gap + inhibitoryRadius, pyr1); inh2.draw(); //inh2.target(pyr1);

var ccOrigin = pyr2.LLx + pyramidalBase + 200; // x-coordinate of where the cortico-coritcals originate from
var cc1 = new CC(pyr1.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr1.LLy - pyramidalHeight - apicalHeight * .75, ccOrigin); cc1.draw();
var cc2 = new CC(pyr2.LLx + pyramidalBase/2 + axonWidth/2 + gap, pyr2.LLy - pyramidalHeight - apicalHeight * .9, ccOrigin); cc2.draw();

var tc1 = new TC(pyr1, 90, "left"); tc1.draw();
var tc2 = new TC(pyr2, 0, "right"); tc2.draw();

var spkrContainer = new imgContainer(spkrSrc, ccOrigin + gap, (cc1.y + cc2.y)/2 - spkrSize/2, spkrSize, spkrSize, 0.5); //spkrContainer.draw();

var allObjects = [pyr1, pyr2, inh1, inh2, cc1, cc2, tc1, tc2, spkrContainer];

var transition1 = [
{obj: pyr1, tgt: [0, 255, 0]},
{obj: pyr2, tgt: [0, 255, 0]},
{obj: spkrContainer, tgt: 1.0}
];

var transition2 = [
{obj: inh1, tgt: [255, 0, 0]},
];


function step1(){
	canvas.removeEventListener('click', step1);
	flash(transition1, 2, 3, 100);
	var tmr4 = setTimeout( function(){ console.log('next step initiated') }, (2*2*3*1000) + 50);
	var tmr4 = setTimeout( function(){ canvas.addEventListener('click', step2); } , (2*2*3*1000) + 50);
}

function step2(){
	step1();
}

canvas.addEventListener('click', step1);
