'use strict';

/**
 * @ngdoc filter
 * @name cinemaApp.filter:splitOnCommas
 * @function
 * @description
 * # splitOnCommas
 * Filter in the cinemaApp.
 */
angular.module('cinemaApp')
  .filter('splitOnCommas', function () {
    return function (input,parts) {
    	var parts = parts || 0;
    	var sentenceParts = input.split(', ');
    	var output = [];
    	for (var i=0;i<parts+1;i+=1) {
    		output.push(sentenceParts[i]);
    	}
    	return output.join(', ');
    };
  });
