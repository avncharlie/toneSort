/*jshint esversion: 6 */

// once set here, will update through interface
var startingBars = 10;
var delay = 1300;

var actualDelay = 2000-delay+100;

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

// redraw on resize
$(window).resize(function(){
    "use strict";
    // redraw canvas
    var canvas = $(canvasSelector);
    canvas.clearCanvas();
    initialiseBars();
});

// initialise display
function initialiseBars() {
    "use strict";
    var canvas = $(canvasSelector), 
        ctx = canvas[0].getContext('2d');
    
    // set width and height of canvas to parent width and height
    ctx.canvas.height = $(canvasParentSelector).innerHeight();
    ctx.canvas.width = $(canvasParentSelector).innerWidth();
    
    // draw bars after initialisation
    drawBars(bars, colourGradient, canvas);
}

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

// updates delay slider
function updateDelay(newDelay) {
    "use strict";
    $("#delay").val(newDelay);
    var convertedPercentage = ((newDelay-100)/1900)*100; //((newDelay-3)/97)*100;
    var offset = 2;
    $("#delayDisplay").css('left', 'calc(' + convertedPercentage + '% - ' + (30*convertedPercentage/100 - offset) +'px)');
    $("#delay").css('display', 'block');
    $("#delayDisplay").css('display', 'block');
    //var secondDisplay = Math.round( (newDelay/1000) * 10) / 10 + "s";
    //$("#delayDisplay").text("5");
    
    if (convertedPercentage > 80) {
        $("#delayIcon").removeClass("fa-angle-double-right");
        $("#delayIcon").addClass("fa-fighter-jet");
    } else if (convertedPercentage > 50) {
        $("#delayIcon").removeClass("fa-fighter-jet fa-angle-right");
        $("#delayIcon").addClass("fa-angle-double-right");
    } else if (convertedPercentage > 20) {
        $("#delayIcon").removeClass("fa-angle-double-right fa-walking");
        $("#delayIcon").addClass("fa-angle-right");
    } else {
        $("#delayIcon").removeClass("fa-angle-right");
        $("#delayIcon").addClass("fa-walking");
    }
    
}

$("#delaySlideContainer").on('input', function(e) {
	"use strict";
    
    var newDelay = $(e.target).val();
    updateDelay(newDelay);
    delay = newDelay;
    actualDelay = 2000 - newDelay + 100;
    console.log(actualDelay);
});

// helper to shuffle array
function shuffleArray(array) {
	"use strict";
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

// toggle play pause button
$(".pausePlayButton").click(function() {
    "use strict";
    $(".pausePlayButton").toggleClass("paused");
    return false;
});

// init on document load
$(document).ready(function() {
	"use strict";
    
    // initialise numBars slider to whatever it is
    updateNumBars(startingBars);
    
    // update delay slider
    updateDelay(delay);
    
    // redraw canvas
    var canvas = $(canvasSelector);
    canvas.clearCanvas();
    
    // draw actual display
    initialiseBars();
    
});