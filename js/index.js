/*jshint esversion: 6 */

// FRAME SKIP

// once set here, will update through interface
var startingBars = 10;
var delay = 500;
var counters = {
    steps: 0,
    comparisons: 0
};

var frequencyVals = [440, 900];

var isPaused = true;

var actualDelay = 700-delay+1;

var canvasSelector = "#barDisplay";
var canvasParentSelector = "#output";   

var colourGradient = ["#FFD184", "#7B68EE"];

var selectedColour = "#7054B2";

// start off with 10 bars
var bars = [...Array(startingBars).keys()];

// init sound
var context = new AudioContext()
var o = context.createOscillator();
o.frequency.value = 440;
o.type = "triangle";
var g = context.createGain();
g.gain.setValueAtTime(0.20, context.currentTime);
o.connect(g);
g.connect(context.destination);
if (context.resume) {
    context.resume();
}
o.start(0);

// init sorts
function bubbleSortGenerator(bars) {
    "use strict";
    // copy bars
    var newBars = [...bars];
    
    var instructions = [];

    var unsortedBoundary = newBars.length - 1;
    var modifiedThisRun = true;
    
    while (modifiedThisRun) {
        modifiedThisRun = false;
        var tempIndex = 0;
        while (tempIndex < unsortedBoundary) {
            
            // select bar
            instructions.push({type: "SELECT", index: tempIndex});
            
            // accessing tempIndex and tempIndex + 1
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            
            instructions.push({type: "INCREMENT", counter: "comparisons"});
            if (newBars[tempIndex] > newBars[tempIndex + 1]) {
                // select second bar
                instructions.push({type: "SELECT", index: tempIndex + 1});
                
                var temp = newBars[tempIndex];
                newBars[tempIndex] = newBars[tempIndex + 1];
                newBars[tempIndex + 1] = temp;
                modifiedThisRun = true;
                
                // swapping - writing to tempIndex and tempIndex + 1
                instructions.push({type: "INCREMENT", counter: "steps"});
                instructions.push({type: "INCREMENT", counter: "steps"});
                
                // swap bars
                instructions.push({type: "SWAP", indexes: [tempIndex, tempIndex + 1]});
            }
            
            // deselect swapped bars
            instructions.push({type: "DESELECT", index: tempIndex});
            instructions.push({type: "DESELECT", index: tempIndex + 1});
            
            tempIndex += 1;
        }
        unsortedBoundary -= 1;
    }
    return instructions;
}
function selectionSortGenerator(bars) {
    "use strict";
    // copy bars
    var newBars = [...bars];
    
    var instructions = [];
    
    for (var outsideIndex = 0; outsideIndex < newBars.length; outsideIndex++) {
        var minIndex = outsideIndex;
        
        instructions.push({type: "SELECT", index: minIndex});
        
        for (var insideIndex = outsideIndex + 1; insideIndex < newBars.length; insideIndex++) {
            
            instructions.push({type: "SELECT", index: insideIndex});
            
            if (newBars[insideIndex] < newBars[minIndex]) {
                if (minIndex !== outsideIndex) {
                    instructions.push({type: "DESELECT", index: minIndex});
                }
                minIndex = insideIndex;
            } else {
                instructions.push({type: "DESELECT", index: insideIndex});
            }
        }
        
        // swap first in loop with minimum
        var temp = newBars[outsideIndex];
        newBars[outsideIndex] = newBars[minIndex];
        newBars[minIndex] = temp;
        
        instructions.push({type: "SWAP", indexes: [outsideIndex, minIndex]});
        instructions.push({type: "DESELECT", index: outsideIndex});
        instructions.push({type: "DESELECT", index: minIndex});
    }
    
    return instructions;
}
function insertionSortGenerator() {}

var sorts = {
    bubbleSort: {
        displayName: "bubble sort",
        generator: bubbleSortGenerator
    },
    selectionSort: {
        displayName: "selection sort",
        generator: selectionSortGenerator
    },
    insertionSort: {
        displayName: "insertion sort",
        generator: insertionSortGenerator
    }
};

// reset stuff
function pauseAndReset() {
    "use strict";
    isPaused = true;
    $(".pausePlayButton").removeClass("paused");
    counters = {
        steps: 0,
        comparisons: 0
    };
    updateCounters();
}

// selected sort
var selectedSort = sorts.bubbleSort;

// start off with 10 bars
var bars = [...Array(startingBars).keys()];

// removes all layers
function clearCanvas() {
    "use strict";
    var layers = [...$(canvasSelector).getLayers()];
    for (var index = 0; index < layers.length; index++) {
        $(canvasSelector).removeLayer(layers[index].name).drawLayers();
    }
}

// randomise bars
$("#randomise").click(function() {
	"use strict";
    
    pauseAndReset();
    
    var canvas = $(canvasSelector);
    // shuffle bars
	shuffleArray(bars);
    // redraw canvas
    clearCanvas();
    // draw
    drawBars(bars, colourGradient, canvas);
});

// redraw on resize
$(window).resize(function(){
    "use strict";
    // redraw canvas
    var canvas = $(canvasSelector);
    clearCanvas();
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
    pauseAndReset();
    
    var newNumBars = $(e.target).val();
    updateNumBars(newNumBars);
    
    var canvas = $(canvasSelector);
    // create new bars array
    bars = [...Array(Number(newNumBars)).keys()];
    // redraw canvas
    clearCanvas();
    // draw
    drawBars(bars, colourGradient, canvas);
});

// updates delay slider
function updateDelay(newDelay) {
    "use strict";
    $("#delay").val(newDelay);
    var convertedPercentage = ((newDelay-1)/700)*100; //((newDelay-3)/97)*100;
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

// update delay
$("#delaySlideContainer").on('input', function(e) {
	"use strict";
    
    var newDelay = $(e.target).val();
    updateDelay(newDelay);
    delay = newDelay;
    actualDelay = 700 - newDelay + 1;
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
    var colourScales = chroma.scale(colourGradient).colors(bars.length);
    
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
    isPaused = !isPaused;
    if (!isPaused) {
        counters = {
            steps: 0,
            comparisons: 0
        };
        updateCounters();
        displaySort();
    }

});

// update sort type
$("#dropdownContainer>p").click(function (event) {
    "use strict";
    pauseAndReset();
    
    var newSelectedSort = $(event.target).text();
    // set current sort to new sort
    Object.keys(sorts).forEach(function(key,index) {
        if (sorts[key].displayName === newSelectedSort) {
            selectedSort = sorts[key];
            $(".selectedSortText").text(selectedSort.displayName);
        }
    });
});

// play button
$("#goButton").click(function () {
    "use strict";
    $(".pausePlayButton").addClass("paused");
    isPaused = false;
    counters = {
        steps: 0,
        comparisons: 0
    };
    updateCounters();
    displaySort();
});

// init on document load
$(document).ready(function() {
	"use strict";
    
    // update numBars slider
    updateNumBars(startingBars);
    
    // update delay slider
    updateDelay(delay);
    
    // update selected sort
    $(".selectedSortText").text(selectedSort.displayName);
    
    // set counters
    updateCounters();
    
    // redraw canvas
    var canvas = $(canvasSelector);
    clearCanvas();
    
    // draw actual display
    initialiseBars();
    
});

// get instructions from current selected sort and play with playSortInstructions
function displaySort() {
    "use strict";
    playSortInstructions(selectedSort.generator(bars));
}

// sleep function
function sleep(ms) {
    "use strict";
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playTone(frequency, seconds) {
    "use strict";
    if (context.resume) {
        context.resume();
    }
    o.frequency.linearRampToValueAtTime(frequency, context.currentTime);
    g.gain.cancelScheduledValues(context.currentTime);
    g.gain.linearRampToValueAtTime(1, context.currentTime);
    g.gain.linearRampToValueAtTime(
        0, context.currentTime + seconds
    );
}

function updateCounters() {
    "use strict";
    Object.keys(counters).forEach(function(key,index) {
        $("#" + key).text(counters[key]);
    });
}

async function playSortInstructions(instructions) {
    "use strict";
    var instruction;
    for (var x = 0; x < instructions.length - 1; x++) {
        if (isPaused) {
            // redraw canvas
            var canvas = $(canvasSelector);
            clearCanvas();
            drawBars(bars, colourGradient, canvas);
            break;
        }
        instruction = instructions[x];
        
        if (instruction.type === "SELECT") {
            
            
            playTone(frequencyVals[0] + (bars[instruction.index] * ((frequencyVals[1]-frequencyVals[0])/bars.length) ), actualDelay/1000);
            
            
            $(canvasSelector).animateLayer("#" + bars[instruction.index], {
                fillStyle: selectedColour
            }, actualDelay, function(){});
        } 
        
        else if (instruction.type === "INCREMENT") {
            counters[instruction.counter] += 1;
            updateCounters();
        }
        
        else if (instruction.type === "SWAP") {
            // actually swap bars array indexes
            var temp = bars[instruction.indexes[0]];
            bars[instruction.indexes[0]] = bars[instruction.indexes[1]];
            bars[instruction.indexes[1]] = temp;
            
            // animate
            var canvas = $(canvasSelector);
            var barWidth = canvas.innerWidth() / bars.length;
            var swapWidth = (instruction.indexes[0] - instruction.indexes[1]) * barWidth;
            // left bar to right
            $(canvasSelector).animateLayer("#" + bars[instruction.indexes[0]], {
                x: "+=" + swapWidth
            }, actualDelay, function(){});
             // right bar to left
            $(canvasSelector).animateLayer("#" + bars[instruction.indexes[1]], {
                x: "-=" + swapWidth
            }, actualDelay, function(){});
        }
        
        else if (instruction.type === "DESELECT") {
            var colourScales = chroma.scale(colourGradient).colors(bars.length);
            $(canvasSelector).animateLayer("#" + bars[instruction.index], {
                fillStyle: colourScales[bars[instruction.index]]
            }, actualDelay, function(){});
        }
        
        // no delay on deselecting or incrementing counters
        if (instruction.type !== "DESELECT" && instruction.type !== "INCREMENT") {
            await sleep(actualDelay);
        }
    }
}