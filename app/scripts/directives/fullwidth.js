'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:fullWidth
 * @description
 * # fullWidth
 */
angular.module('cinemaApp')
  .directive('fullWidth', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
		    var fixedWidth = element.parent()[0].offsetWidth - attrs.margin;

    		element.css({ 
    			width: fixedWidth + 'px',
    		});
      }
    };
  });
