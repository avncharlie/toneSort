/*jshint esversion: 6 */

// once set here, will update through interface
var startingBars = 10;

var canvasSelector = "#barDisplay";
var canvasParentSelector = "#output";

var colourGradient = ["#FFD184", "#7B68EE"];

// start off with 10 bars
var bars = [...Array(startingBars).keys()];

// randomise bars
$("#randomise").click(function() {
	"use strict";
    var canvas = $(canvasSelector);
    // shuffle bars
	shuffleArray(bars);
    // redraw canvas
    canvas.clearCanvas();
    // draw
    drawBars(bars, colourGradient, canvas);
});

// update the number of bars slider and all its related components
// ensures it is visible
function updateNumBars(newNumBars) {
    "use strict";
    $("#numBars").val(newNumBars);
    var convertedPercentage = ((newNumBars-3)/97)*100;
    var offset = 2;
    $("#numBarsDisplay").css('left', 'calc(' + convertedPercentage + '% - ' + (30*convertedPercentage/100 - offset) +'px)');
    $("#numBars").css('display', 'block');
    $("#numBarsDisplay").css('display', 'block');
    $("#numBarsDisplay").text(newNumBars);
}

// add or take away bars
$("#numBars").on('input', function(e) {
	"use strict";
    
    var newNumBars = $(e.target).val();
    updateNumBars(newNumBars);
    
    var canvas = $(canvasSelector);
    // create new bars array
    bars = [...Array(Number(newNumBars)).keys()];
    // redraw canvas
    canvas.clearCanvas();
    // draw
    drawBars(bars, colourGradient, canvas);
});

// helper to shuffle array
function shuffleArray(array) {
	"use strict";
	
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
    	array[randomIndex] = temporaryValue;
	}

	return array;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// bars doesn't have to be in order
function drawBars(bars, colorGradient, canvas) {
    "use strict";
    var colourScales = chroma.scale(colorGradient).colors(bars.length);
    
    var barWidth = canvas.innerWidth() / bars.length ;
    var pixelHeightIncrement =  canvas.innerHeight() / (Math.max(...bars) + 1);
    
    for (var barIndex = 0; barIndex < bars.length ; barIndex++) {
        var height = pixelHeightIncrement * (bars[barIndex] + 1);
        canvas.drawRect({
            layer: true,
            name: '#' + bars[barIndex],
            fillStyle: colourScales[bars[barIndex]],
            x: barWidth * barIndex + barWidth/2, y: canvas.innerHeight() - height/2,
            width: barWidth,
            height: height
        });
    }
}

// init on document load
$(document).ready(function() {
	"use strict";
    
    // initialise numBars slider to whatever it is
    updateNumBars(startingBars);
    
    var canvas = $(canvasSelector), 
        ctx = canvas[0].getContext('2d');
    
    // set width and height of canvas to parent width and height
    ctx.canvas.height = $(canvasParentSelector).innerHeight();
    ctx.canvas.width = $(canvasParentSelector).innerWidth();
    
    // draw bars after initialisation
    drawBars(bars, colourGradient, canvas);
});