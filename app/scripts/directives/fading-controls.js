'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:fadingControls
 * @description
 * # fadingControls
 */
angular.module('cinemaApp')
  .directive('fadingControls', function ($timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
      	var timeouts = [];
      	scope.$on('loaded', function() {
          for (var i = 0; i < timeouts.length; i += 1) {
            $timeout.cancel(timeouts[i]);
            timeouts.shift();
          }
	      	$timeout(function() {
	      		element.addClass('hidden');
	      	},3000);
      	});
      	
        element.bind('mouseover', function() {
        	for (var i = 0; i < timeouts.length; i += 1) {
        		$timeout.cancel(timeouts[i]);
        		timeouts.shift();
        	}
        	element.removeClass('hidden');
        	var timeout = $timeout(function() {
      			element.addClass('hidden');
      		},4500);
        	timeouts.push(timeout);
        });
      }
    };
  });
