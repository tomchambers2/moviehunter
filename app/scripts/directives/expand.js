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
          $rootScope.$emit('contract', element);
        });
        element.css('height', attrs.fixedheight);

        $rootScope.$on('contract', function(event, target) {
          if (element != target) {
            element.css('height', attrs.fixedheight);
          }
        });

      }
    };
  });
