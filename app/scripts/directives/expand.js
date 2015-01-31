'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:expand
 * @description
 * # expand
 */
angular.module('cinemaApp')
  .directive('expand', function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$watch('open', function(value) {
        	element.css('height', (value ? 'auto' : attrs.fixedheight));
        });
        element.css('height', attrs.fixedheight);
      }
    };
  });
