var indexArray;

// random bar arranging
// adding/taking away bars (recolouring)
// actual sorting
// ui at side

// stores indexes of items as they get sorted
indexArray = [...Array(50).keys()];

// shuffle array
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
}

// randomises bars
function randomiseAndMoveBars(currentIndexArray) {
	"use strict";
	
	// shuffle them
	var newIndexArray = shuffleArray(currentIndexArray);
	
	// move to positions
	moveBarsToPositions(indexArray, newIndexArray);
	
	return newIndexArray;
}

// init on document load
$(document).ready(function() {
	"use strict";
	
	// initialise bars
	addBars(indexArray.length);
	initBarHeights(indexArray.length);
	
	// colour bars
	colourBars(indexArray.length);
	
	//for (var x = 0; x < 100; x++) {
	//	indexArray = randomiseAndMoveBars(indexArray);
	//}
	
	//indexArray = randomiseAndMoveBars(indexArray);
});

// initialises bars as empty divs and add to DOM
function addBars(numBars) {
	"use strict";
	for (var x = 0; x < numBars; x++){
		var foo = $("<div></div>").addClass("bar");
		$("#output").append(foo);
	}
}

// colour bars
function colourBars(numBars) {
	"use strict";
	var scales = chroma.scale(["#FFD184", "#7B68EE"]).colors(numBars);
	
	var counter = 0;
	$('#output').children('.bar').each(function () {
		$(this).css({"background-color": scales[counter]}).attr({id: counter});
		counter++;
	});
}

// initalise height of bars based on given number of bars
function initBarHeights(numBars) {
	"use strict";
	var heightCounter = 0;
	var counter = 0;
	$('#output').children('.bar').each(function () {
		heightCounter = heightCounter + (100/numBars);
		$(this).css({"height": heightCounter + "%"}).attr({id: counter});
		counter++;
	});
}

// swaps the two requested bar indexes. if startSwapIndex is an array, will swap all indexes in that array
function swapBars(startSwapIndex, endSwapIndex, arrayIndexes) {
	"use strict";
	
	// swapping one element
	if (typeof(startSwapIndex) === 'number') {
		// calculate current transform values of indexes in percentages
		var currentStartIndexTransfromVal = (startSwapIndex - arrayIndexes[startSwapIndex]) * 100;
		var currentEndIndexTransfromVal = (endSwapIndex - arrayIndexes[endSwapIndex]) * 100;
	
		// calculate the transform to be applied (distance of indexes + current transfrom vals)
		var startTransfrom = (endSwapIndex-startSwapIndex) * 100 + currentStartIndexTransfromVal;
		var endTransfrom = (startSwapIndex-endSwapIndex) * 100 + currentEndIndexTransfromVal;
	
		// animate transform
		$("#" + arrayIndexes[startSwapIndex]).css({transform: "translateX(" + startTransfrom + "%)"});
		$("#" + arrayIndexes[endSwapIndex]).css({transform: "translateX(" + endTransfrom + "%)"});
	} else {
		// swapping multiple elements
		var largestIndex = startSwapIndex[startSwapIndex.length - 1];
		var smallestIndex = startSwapIndex[0];
		
		// calculate shift values and end values to be swapped
		var shiftVal;
		var endIndexes = [];
		if (endSwapIndex >  largestIndex) {
			// rightways shift
			shiftVal = endSwapIndex - largestIndex;
			for (var a = largestIndex + 1; a <= endSwapIndex; a++) {
				endIndexes.push(a);
			}
		} else {
			// leftways shift
			shiftVal = endSwapIndex - smallestIndex;
			for (var b = endSwapIndex; b < smallestIndex; b++) {
				endIndexes.push(b);
			}
		}
		shiftVal *= 100;
		
		// translating all elements in whatever direction
		for (var x = 0; x < startSwapIndex.length; x++) {
			var transformStart = (startSwapIndex[x] - arrayIndexes[startSwapIndex[x]]) * 100 + shiftVal;
			$("#" + arrayIndexes[startSwapIndex[x]]).css({transform: "translateX(" + transformStart + "%)"});
		}
		
		// moving all elements to be swapped backwards
		
		// SHIFTVAL NEEDS TO BE RECALCULATED
		// if shift from left to right, smallest endval to smallest startval
		// else, biggest endval to 
		
		if (endSwapIndex >  largestIndex) {
			// rightways shift
			shiftVal = endIndexes[0] - startSwapIndex[0];
		} else {
			// leftways shift
			shiftVal = endIndexes[endIndexes.length - 1] - startSwapIndex[startSwapIndex.length - 1];
		}
		shiftVal *= 100;
		
		for (x = 0; x < endIndexes.length; x++) {
			var transformEnd = (endIndexes[x] - arrayIndexes[endIndexes[x]]) * 100 - shiftVal;
			$("#" + arrayIndexes[endIndexes[x]]).css({transform: "translateX(" + transformEnd + "%)"});
		}
	}
}

// given an array move bars to positions in array
function moveBarsToPositions(currentIndexArray, newIndexArray) {
	"use strict";
	
	var currentTransfrom;
	var neededTransfrom;
	var finalTransfrom;
	for (var x = 0; x < currentIndexArray.length; x++) {
		// get transfrom in current state
		currentTransfrom = (x - currentIndexArray[x]) * 100;
		
		// get needed transform
		neededTransfrom = (newIndexArray.indexOf(currentIndexArray[x]) - x) * 100;
		
		// calculate final transfrom
		finalTransfrom = currentTransfrom + neededTransfrom;
		
		$("#" + currentIndexArray[x]).css({transform: "translateX(" + finalTransfrom + "%)"});
		
	}
}