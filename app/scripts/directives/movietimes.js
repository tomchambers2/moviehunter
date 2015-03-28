'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:movieTimes
 * @description
 * # movieTimes
 */

/*global angular: true, _ : true */

angular.module('cinemaApp')
  .directive('movieTimes', ['$compile', function ($compile) {
    return {
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.$watch('selectedCinema', function() {
          updateDetails();
        });

        scope.$watch('selectedDay', function() {
          updateDetails();
        });        

        scope.$watch('cinemas', function(value) {
          scope.cinemaList = value;
          updateDetails();
        }, true);

        function addOtherDay(day, cinema, array) {
          if (scope.movie[cinema.tid][scope.selectedDays[day]]) {
            array.push('<a ng-click="selectDay('+day+');$event.stopPropagation()">'+moment(scope.selectedDays[day]).format('dddd')+'</a>');
          }
        }

        scope.bounce = function(tid) {
          scope.$emit('bounce', tid);
        }
        scope.stopBounce = function(tid) {
          scope.$emit('stopBounce', tid);
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
                if (otherDays.length) {
                  //CINEMA NOT SHOWING TODAY, BUT OTHER DAYS
                  html.push('<div class="times-box" ng-mouseover="bounce(\''+cinema.tid+'\')" ng-mouseleave="stopBounce(\''+cinema.tid+'\')"><p>'+cinema.title+'</p>'+ 
                  '<p>Showing '+otherDays.join(', ')+'</i></p></div>');
                } else {
                  html.push('<div class="times-box"  ng-mouseover="bounce(\''+cinema.tid+'\')" ng-mouseleave="stopBounce(\''+cinema.tid+'\')"><p>'+cinema.title+'</p>'+'<p><i>Not showing here</i></p>');
                }
              } else {
                html.push('<div class="times-box" ng-mouseover="bounce(\''+cinema.tid+'\')" ng-mouseleave="stopBounce(\''+cinema.tid+'\')"><p>'+cinema.title+'</p>'+
                '<p>'+scope.movie[cinema.tid][scope.selectedDay].times.join(' | ')+'</p></div>');
              }
            };

            html.unshift('<p class="text-center"><strong>'+moment(scope.selectedDay).format('dddd')+' showtimes</strong></p>');

            element.html(html);
            $compile(element.contents())(scope);     
            return;
          } else {          
            if (!scope.movie[scope.selectedCinema][scope.selectedDay]) {
              element.html('<div class="times-box" ng-mouseover="bounce(\''+scope.selectedCinemaObject.tid+'\')" ng-mouseleave="stopBounce(\''+scope.selectedCinemaObject.tid+'\')"><p>Not showing here</p></div>');
              element.html(html);
              $compile(element.contents())(scope); 
              return;
            }
            var cinema = _.findWhere(scope.cinemas, { tid: scope.selectedCinema });
            var html = '<p class="text-center"><strong>'+moment(scope.selectedDay).format('dddd')+' showtimes</strong></p> <div class="times-box" ng-mouseover="bounce(\''+cinema.tid+'\')" ng-mouseleave="stopBounce(\''+cinema.tid+'\')"><p>'+cinema.title+'</p>'+
              '<p>'+scope.movie[scope.selectedCinema][scope.selectedDay].times.join(' | ')+'</p></div>';
            element.html(html);
            $compile(element.contents())(scope); 
          }

        }

        updateDetails();
      }
    };
  }]);
