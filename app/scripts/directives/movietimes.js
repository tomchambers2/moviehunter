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
      link: function postLink(scope, element, attrs) {
        //TODO: this isn't quite right. or is it? at the moment, it will only reveal
        // movie times when you open the tab. I'm not sure whether that's better than
        // recalculating everything every time you move. which is a bit nuts. probably is.
        // don't bother updating things that are off screen. be just in time.
        // so now it updates only if the tab is open.

        scope.$watch('open', function(value) {
          if (!value) return;
          console.log('opened - updating');
          updateDetails();
        });

        scope.$watch('selectedCinema', function() {
          if (!scope.open) return;
          console.log('cinema selected - updating');
          updateDetails();
        });

        scope.$watch('selectedDay', function() {
          if (!scope.open) return;
          console.log('cinema selected - updating');
          updateDetails();
        });        

        attrs.$observe('cinemas', function(value) {
          if (!scope.open) return;
          console.log('cinemas have changed - updating');
          value = JSON.parse(value);
          scope.cinemaList = value;
          updateDetails();
        });

        function addOtherDay(day, cinema, array) {
          if (scope.movie[cinema.tid][scope.selectedDays[day]]) {
            array.push('<a ng-click="selectDay('+day+')">'+moment(scope.selectedDays[day]).format('dddd')+'</a>');
          }
        }

        // TODO: this should get a list of tids fromt he movie object, but it needs to
        // be nested inside a cinemas key otherwise its mixed up
        // also this feels very slow code? doesn't seem to impact perforamnce much though
        function updateDetails() {        
          if (!scope.selectedCinema) {
            var cinema;
            var html = [];
            //add all the cinemas showing
            for (var i = 0; i < scope.cinemaList.length; i++) {
              cinema = scope.cinemaList[i];
              if (!scope.movie[cinema.tid]) continue;
              if (!scope.movie[cinema.tid][scope.selectedDay]) {
                var otherDays = [];
                for (var j = 0; j < 4; j++) {
                    if (scope.selectedDays[j] === scope.selectedDay) continue;
                    addOtherDay(j, cinema, otherDays);
                };
                html.push('<div class="times-box"><p>Showtimes for '+cinema.title+' '+moment(scope.selectedDay).format('dddd')+'</p>'+
                '<p><i>No times '+moment(scope.selectedDay).format('dddd')+'. Showing '+otherDays.join(', ')+'</i></p></div>');
              } else {
                html.push('<div class="times-box"><p>Showtimes for '+cinema.title+' today</p>'+
                '<p>'+scope.movie[cinema.tid][scope.selectedDay].times.join(' | ')+'</p></div>');
              }
            };
            element.html(html);
            return;
          } else {          
            if (!scope.movie[scope.selectedCinema][scope.selectedDay]) {
              element.html('<div class="times-box"><p>Not showing here on '+moment(scope.selectedDay).format('dddd')+'</p></div>');
              return;
            }
            var cinema = _.findWhere(scope.cinemas, { tid: scope.selectedCinema });
            var html = '<div class="times-box"><p>Showtimes for '+cinema.title+' today</p>'+
              '<p>'+scope.movie[scope.selectedCinema][scope.selectedDay].times.join(' | ')+'</p></div>';
            element.html(html);
          }

        }
      }
    };
  });
