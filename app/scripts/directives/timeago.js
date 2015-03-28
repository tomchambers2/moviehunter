'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:timeAgo
 * @description
 * # timeAgo
 */
angular.module('cinemaApp')
  .directive('timeAgo', function () {
    return {
      restrict: 'A',
      scope: {
      	timeAgo: '='
      },
      link: function postLink(scope, element, attrs) {
      	function updateView(content) {
      		element.html(content);
      	}

      	function checkTime(timeAgo) {
	      	if (moment(timeAgo).isBefore(moment().subtract(1, 'years'))) {
	      		updateView(moment(timeAgo).format('YYYY'));
	      	} else {
	      		updateView(moment(timeAgo).fromNow());
	      	}
      	}

      	checkTime(scope.timeAgo);
      }
    };
  });
