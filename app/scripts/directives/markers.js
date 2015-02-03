'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:markers
 * @description
 * # markers
 */
angular.module('cinemaApp')
  .directive('markers', function () {
    return {
      restrict: 'E',
      // scope: {
      // 	map: '=',
      // 	cinemas: '='
      // },
      link: function postLink(scope, element, attrs) {
      	scope.markers = {};
      	scope.prevTids = [];     

        function createMarker(cinema) {
          var marker = new google.maps.Marker({
              position: {
                lat: cinema.coords[0],
                lng: cinema.coords[1]
              },
              map: scope.map,
              title: cinema.title,
              id: cinema.tid,
              icon: 'images/cinema_icons/cinema.png'
          });   
          scope.markers[cinema.tid] = marker; 
          console.log(scope.markers);
        };

        //watch for change in movie filter
          //if filter is set to null, fill in the cinemas not on map
          //if filter is set, remove cinemas not there, add cinemas prev removed by filter

        attrs.$observe('selectedMovie', function(value) {
          console.log("selectedMovie changed",value);
          if (!value) {
            for (var i = 0; i < scope.cinemaList.length; i++) {
              var cinema = scope.cinemaList[i];

              if (cinema===null) continue;

              if (scope.markers[cinema.tid]) {
                console.log(scope.markers);
                console.log("CINEMA ALREDY THERE",cinema.title);
                continue;
              } else {
                createMarker(cinema);

                console.log("CINEMA added 2 map THERE",cinema.title);     
              }      
            };
          } else if (value) {
            //remove all cinemas that do not contain this
            for (var i = 0; i < scope.cinemaList.length; i++) {
              var cinema = scope.cinemaList[i];
              if (cinema===null) continue;

              if (!_.contains(cinema.movies, value)) {
                if (scope.markers[cinema.tid]) {
                  //REMOVE THE CINEMA
                  scope.markers[cinema.tid].setMap(null);
                  delete scope.markers[cinema.tid];
                };      
              } else {
                if (!scope.markers[cinema.tid]) {
                  createMarker(cinema);  
                  scope.markers[cinema.tid] = marker;                   
                };
              };
            };            
          }
        });

        attrs.$observe('cinemas', function(value) {
        	value = JSON.parse(value);
          scope.cinemaList = value;

          value = _.filter(value, function(cinema) {
            if (cinema!=null) return true;
          });
          
        	var newCinemas = _.difference(_.pluck(value,'tid'), scope.prevTids);
        	for (var i = 0; i < newCinemas.length; i++) {
            var newCinema = _.findWhere(value, { 'tid': newCinemas[i] });

            if (attrs.selectedMovie) {
              if (!_.contains(newCinema.movies, attrs.selectedMovie)) continue;
            }

            if (newCinema===null) continue;
            createMarker(newCinema);
        	};

        	var oldCinemas = _.difference(scope.prevTids, _.pluck(value,'tid'));

        	for (var j = 0; j < oldCinemas.length; j++) {
            if (scope.markers[oldCinemas[j]]) {
          		scope.markers[oldCinemas[j]].setMap(null);
          		delete scope.markers[oldCinemas[j]];
            }
        	};

        	scope.prevTids = _.pluck(value,'tid');
        });

      }
    };
  });
