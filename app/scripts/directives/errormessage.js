'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:errorMessage
 * @description
 * # errorMessage
 */
angular.module('cinemaApp')
  .directive('errorMessage', function ($timeout) {
    return {
      template: '<div class="alert-box alert hidden text-center"></div>',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        
        scope.$on('error',function() {
        	element.removeClass('hidden');
        	element.text('Sorry, we couldn\'t find that address');
        	$timeout(function() {
        		element.addClass('hidden');
        	}, 2000);
        });
      }
    };
  });
