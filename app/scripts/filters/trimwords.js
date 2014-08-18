'use strict';

/**
 * @ngdoc filter
 * @name cinemaApp.filter:trimWords
 * @function
 * @description
 * # trimWords
 * Filter in the cinemaApp.
 */
angular.module('cinemaApp')
  .filter('trimWords', function () {
    return function (input, words) {
    	var words = words || 1;
    	var split_words = input.split(' ');
    	var output = [];
      	for (var i=0; i<words; i+=1) {
      		output.push(split_words[i]);
      	}
      	return output.join(' ');
    };
  });
