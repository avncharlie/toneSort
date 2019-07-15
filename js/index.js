/*jshint esversion: 6 */

// FRAME SKIP
// FIX SOUND

// once set here, will update through interface
var startingBars = 10;
var delay = 500;
var counters = {
    steps: 0,
    comparisons: 0
};
var gainPercentage = 0.8;

var frequencyVals = [300, 800];
var gainRange = [0, 1];

var isMuted = false;

var finishedAnimation = true;
var isPaused = true;

var actualDelay = 700-delay+1;

var canvasSelector = "#barDisplay";
var canvasParentSelector = "#output";   

var colourGradient = ["#FFD184", "#7B68EE"];

var selectedColour = "#7054B2";

var controlsPoppedOut = false;

// start off with 10 bars
var bars = [...Array(startingBars).keys()];

// init sound
var audioCtx = new (window.AudioContext || window.webkitAudioContext);

var volume = audioCtx.createGain();
volume.connect(audioCtx.destination);
       
var tone = audioCtx.createOscillator();
tone.frequency.value = frequencyVals[0];
tone.type = "triangle";
tone.start();
tone.connect(volume);
setGain(0, 0.0000001);

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
            
            // one comparison for checking if current < minIndex
            instructions.push({type: "INCREMENT", counter: "comparisons"});
            
            // one access in accessing insideIndex and another for minIndex
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            
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
        
        // two accesses for swapping
        instructions.push({type: "INCREMENT", counter: "steps"});
        instructions.push({type: "INCREMENT", counter: "steps"}); 
        
        instructions.push({type: "DESELECT", index: outsideIndex});
        instructions.push({type: "DESELECT", index: minIndex});
    }
    
    return instructions;
}
function insertionSortGenerator(bars) {
    "use strict";
    // copy bars
    var newBars = [...bars];
    
    var instructions = [];
    
    for (var x = 1; x < newBars.length; x++) {
        
        instructions.push({type: "SELECT", index: x});
        
        var searchIndex = x - 1;
        var currentlyMoving = x;
        
        
        while (searchIndex >= 0 && newBars[currentlyMoving] < newBars[searchIndex]) {
            // one comparison checking if newBars[currentlyMoving] < newBars[searchIndex]
            instructions.push({type: "INCREMENT", counter: "comparisons"});
            
            // accesses for newBars[currentlyMoving] and newBars[searchIndex]
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            
            instructions.push({type: "SELECT", index: searchIndex});
            
            var temp = newBars[currentlyMoving];
            newBars[currentlyMoving] = newBars[searchIndex];
            newBars[searchIndex] = temp;
            
            
            instructions.push({type: "SWAP", indexes: [searchIndex, currentlyMoving]});
            // two array accesses for the swap
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "DESELECT", index: searchIndex});
            instructions.push({type: "DESELECT", index: currentlyMoving});
            
            currentlyMoving = searchIndex;
            searchIndex -= 1;
            
        }
        instructions.push({type: "DESELECT", index: x});
    }
    instructions.push({type: "DESELECT", index: x});
    return instructions;
}
function cocktailSortGenerator(bars) {
    "use strict";
    // copy bars
    var newBars = [...bars];
    
    var instructions = [];
    
    var swapped = true;
    var start = 0;
    var end = newBars.length - 1;
    
    while (swapped) {
        swapped = false;
        
        // forward pass
        for (var x = start; x < end; x++) {
            
            instructions.push({type: "SELECT", index: x});
            
             // accessing x and x + 1
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            
            instructions.push({type: "INCREMENT", counter: "comparisons"});
            if (newBars[x] > newBars[x + 1]) {
                instructions.push({type: "SELECT", index: x + 1});
                
                // swap
                var temp = newBars[x];
                newBars[x] = newBars[x + 1];
                newBars[x + 1] = temp;
                swapped = true;
                
                // swapping - writing to x and x + 1
                instructions.push({type: "INCREMENT", counter: "steps"});
                instructions.push({type: "INCREMENT", counter: "steps"});
                
                instructions.push({type: "SWAP", indexes: [x, x + 1]});
            }
            
            instructions.push({type: "DESELECT", index: x});
            instructions.push({type: "DESELECT", index: x + 1});
        }
        
        if (!swapped) {
            break; // is sorted
        } else {
            // prepare for next passthrough
            swapped = false;
        }
        
        end--;
        
        // backward pass
        for (var y = end; y > start; y--) {
            
            instructions.push({type: "SELECT", index: y});
            
            // accessing y and y - 1
            instructions.push({type: "INCREMENT", counter: "steps"});
            instructions.push({type: "INCREMENT", counter: "steps"});
            
            instructions.push({type: "INCREMENT", counter: "comparisons"});
            if (newBars[y] < newBars[y - 1]) {
                instructions.push({type: "SELECT", index: y - 1});
                
                // swap
                var temp2 = newBars[y];
                newBars[y] = newBars[y - 1];
                newBars[y - 1] = temp2;
                swapped = true;
                
                // swapping - writing to y and y - 1
                instructions.push({type: "INCREMENT", counter: "steps"});
                instructions.push({type: "INCREMENT", counter: "steps"});
                
                instructions.push({type: "SWAP", indexes: [y, y - 1]});
            }
            instructions.push({type: "DESELECT", index: y});
            instructions.push({type: "DESELECT", index: y - 1});
        }
        
        start++;
    }
    
    return instructions;
}

// global object storing all sort generators
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
    },
    cocktailSort: {
        displayName: "cocktail sort",
        generator: cocktailSortGenerator
    }
};

// reset stuff
function pauseAndReset() {
    "use strict";
    setGain(0, actualDelay/1000);
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

// popout controls on small screens
$("#controlPopoutButton").click(function() {
	"use strict";
    
    if (!controlsPoppedOut) {
        $("#controls").css({display: "block"});
        $("#output").css({width: "calc(100% - 210px)"});
        controlsPoppedOut = true;
    } else {
        $("#controls").css({display: "none"});
        $("#output").css({width: "100%"});
        controlsPoppedOut = false;
    }
    
    var canvas = $(canvasSelector);
    clearCanvas();
    initialiseBars();
});

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

// volume button
$(".volumeButton").click(function() {
    "use strict";
    if (!isMuted) {
        setGain(0, 0.0000001);
        isMuted = true;
        $("#volumeIcon").removeClass("fa-volume-up");
        $("#volumeIcon").addClass("fa-volume-mute");

    } else {
        setGain(gainPercentage, 0.01);
        isMuted = false;
        $("#volumeIcon").removeClass("fa-volume-mute");
        $("#volumeIcon").addClass("fa-volume-up");
    }
});

// redraw resize
$(window).resize(function(){
    "use strict";
    // making sure correct display is showing for screen size
    if (window.innerWidth >= 900) {
        controlsPoppedOut = false;
        $("#output").css({width: "calc(100% - 250px)"});
        $("#controls").css({display: "block"});
    } else if (window.innerWidth >= 750) {
        controlsPoppedOut = false;
        $("#output").css({width: "calc(100% - 210px)"});
        $("#controls").css({display: "block"});
    } else {
        if (!controlsPoppedOut) {
            $("#output").css({width: "100%"});
            $("#controls").css({display: "none"});
        } else {
            $("#output").css({width: "calc(100% - 210px)"});
            $("#controls").css({display: "block"});
        }
    }
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

function updateVolume(newVolume) {
    "use strict";
    $("#volume").val(newVolume);
    $("#volume").css('display', 'block');
    
    var convertedPercentage = newVolume;
    var offset = 2;
    
    $("#volumeDisplay").css('left', 'calc(' + convertedPercentage + '% - ' + (30*convertedPercentage/100 - offset) +'px)');
    
    $("#volumeDisplay").css('display', 'block');
    
    $("#volumeDisplay").text(parseInt(newVolume));
}

// change gain
$("#volume").on('input', function(e) {
	"use strict";
    if (isMuted) {
        isMuted = false;
        $("#volumeIcon").removeClass("fa-volume-mute");
        $("#volumeIcon").addClass("fa-volume-up");
    }
    gainPercentage = $(e.target).val()/100;
    updateVolume(gainPercentage*100);
    if (!finishedAnimation) {
         setGain(gainPercentage, 0.01);
    }
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
$("#dropdownContainer").on('click', 'p', function(event){
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

// wait for animation to stop
function waitForAnimationToStop() {
    "use strict";
    return new Promise(function(resolve) {
        if (finishedAnimation) {
            resolve();
        }
    });
}

// async as it waits for the promise returned by waitForAnimationToStop to resolve
async function goButton() {
    "use strict";
    
    if (!finishedAnimation) {
        console.log("uh oh");
        await waitForAnimationToStop();
    }
    
    $(".pausePlayButton").addClass("paused");
    isPaused = false;
    counters = {
        steps: 0,
        comparisons: 0
    };
    updateCounters();
    displaySort();
}

// play button (offloads to goButton() as it has to be async)
$("#goButton").click(function () {
    "use strict";
    goButton();
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
    
    // populate sorts list
    Object.keys(sorts).forEach(function(key,index) {
        $("#dropdownContainer").append("<p>" + sorts[key].displayName + "</p>");
    });
    
    // set gain
    updateVolume(gainPercentage*100);
    
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

// updates the counters based on the global counters object
function updateCounters() {
    "use strict";
    Object.keys(counters).forEach(function(key,index) {
        $("#" + key).text(counters[key]);
    });
}

// switches to requested frequency
function playTone(newFreq) {
    "use strict";
    audioCtx.resume().then(() => {
        if (!isMuted) {
            setGain(gainPercentage, 0.01);
        }
        tone.frequency.linearRampToValueAtTime(newFreq, audioCtx.currentTime + 0.01);
    });
}

// given a percentage value, sets the gain
function setGain(gainPercentage, delay) {
    "use strict";
    var newGain = ((gainRange[1] - gainRange[0]) * (gainPercentage)) + gainRange[0];
    volume.gain.linearRampToValueAtTime(newGain, audioCtx.currentTime + delay);
}

// play the generated sort instructions
async function playSortInstructions(instructions) {
    "use strict";
    finishedAnimation = false;
    if (!isMuted) {
        setGain(gainPercentage, 0.01);
    }
    var instruction;
    for (var x = 0; x < instructions.length - 1; x++) {
        if (isPaused) {
            finishedAnimation = true;
            // redraw canvas
            var canvas = $(canvasSelector);
            clearCanvas();
            drawBars(bars, colourGradient, canvas);
            break;
        }
        instruction = instructions[x];
        
        if (instruction.type === "SELECT") {
            
            
            playTone(frequencyVals[0] + (bars[instruction.index] * ((frequencyVals[1]-frequencyVals[0])/bars.length) ));
            
            
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
    setGain(0, actualDelay/1000);
    playTone(0); // workaround for when tone randomly still plays
    finishedAnimation = true;
    isPaused = true;
    $(".pausePlayButton").removeClass("paused");
}