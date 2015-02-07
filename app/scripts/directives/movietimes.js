'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:movieTimes
 * @description
 * # movieTimes
 */

/*global angular: true, _ : true */

angular.module('cinemaApp')
  .directive('movieTimes', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element) {
        scope.$watch('selectedCinema', function() {
          updateDetails();
        });

        function updateDetails() {        
          if (!scope.selectedCinema) {
            return;
          }
          var cinema = _.findWhere(scope.cinemas, { tid: scope.selectedCinema });
          var html = '<p>Showtimes for '+cinema.title+' today</p>'+
            '<p>'+scope.movie[scope.selectedCinema][scope.selectedDay].times.join(' | ')+'</p>';
          element.html(html);
        }

        updateDetails();
      }
    };
  });
