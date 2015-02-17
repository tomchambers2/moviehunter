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
            var cinema, html = '';
            //add all the cinemas showing
            for (var i = 0; i < scope.cinemas.length; i++) {
              cinema = scope.cinemas[i];
              if (!scope.movie)
              html += '<div class="times-box"><p>Showtimes for '+cinema.title+' today</p>'+
              '<p>'+scope.movie[cinema.tid][scope.selectedDay].times.join(' | ')+'</p></div>';
            };
            element.html(html);
            console.log('should show',html);              
          }
          if (!scope.movie[scope.selectedCinema][scope.selectedDay]) {
            element.html('<div class="times-box"><p>Not showing here on '+moment(scope.selectedDay).format('dddd')+'</p></div>');
            return;
          }
          var cinema = _.findWhere(scope.cinemas, { tid: scope.selectedCinema });
          var html = '<div class="times-box"><p>Showtimes for '+cinema.title+' today</p>'+
            '<p>'+scope.movie[scope.selectedCinema][scope.selectedDay].times.join(' | ')+'</p></div>';
          element.html(html);
        }

        updateDetails();
      }
    };
  });
