var indexArray;

// stores indexes of items as they get sorted
indexArray = [0, 1, 2, 3, 4, 5];

// init on document load
$(document).ready(function() {
	"use strict";
	
	createBars(indexArray);
	initBars(indexArray);
});

// initialises bars as empty divs and add to DOM
function createBars(indexArray) {
	"use strict";
	for (var x = 0; x < indexArray.length; x++){
		var foo = $("<div></div>").addClass("bar");
		$(".output").append(foo);
	}
}

// initalise height of bars based on given indexArray
function initBars(indexArray) {
	"use strict";
	var heightCounter = 0;
	var counter = 0;
	$('.output').children('div').each(function () {
		heightCounter = heightCounter + (100/indexArray.length);
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