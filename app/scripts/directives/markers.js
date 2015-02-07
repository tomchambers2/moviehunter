'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:markers
 * @description
 * # markers
 */
angular.module('cinemaApp')
  .directive('markers', function ($rootScope) {
    return {
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      	scope.markers = {};
      	scope.prevTids = [];

        function updateMovieTimes(cinema) {
          var movie = _.findWhere(scope.movies, { id: attrs.selectedMovie });
          var date = scope.selectedDay;
          var movieTimes = [];
          movieTimes.push('<strong>Showtimes for '+moment(date).format('dddd')+'</strong>');
          movieTimes.push(movie[cinema.tid][date].times.join(', '));

          scope.markers[cinema.tid].movieInfo = '<strong>'+cinema.title+'</strong><br><i>Click for all movies at this cinema</i><ul class="movie-list"><li>'+movieTimes.join('</li><li>')+'</li></ul>';          
        }

        function createMarker(cinema) {
          var marker = new google.maps.Marker({
              position: {
                lat: cinema.coords[0],
                lng: cinema.coords[1]
              },
              map: scope.map,
              title: cinema.title,
              id: cinema.tid,
              icon: '/images/cinema_icons/cinema.png'
          });
          var movies = JSON.parse(attrs.movies);
          cinema.movieDetails = [];
          cinema.movieTimes = [];

          if (cinema.movies) {
            if (attrs.selectedMovie) {
              var movie = _.findWhere(movies, { id: attrs.selectedMovie });
              var date = scope.selectedDay;
              cinema.movieTimes.push('Showtimes for '+moment(date).format('ddd'));
              cinema.movieTimes.push(movie[cinema.tid][date].times.join(', '));
            }

            for (var i = 0; i < cinema.movies.length; i++) {
              var movie = _.findWhere(movies, { id: cinema.movies[i] });
              cinema.movieDetails.push(movie.title);
            }
          }

          marker.movieInfo = '<strong>'+cinema.title+'</strong><br><i>Click to filter by this cinema</i><ul class="movie-list"><li>'+cinema.movieTimes.join('</li><li>')+'</li></ul>';
          marker.cinemaInfo = '<strong>'+cinema.title+'</strong><br><i>Click to filter by this cinema</i><ul class="movie-list"><li>'+cinema.movieDetails.join('</li><li>')+'</li></ul>';

          var infowindow = new google.maps.InfoWindow({
              maxWidth: 230
          });

          google.maps.event.addListener(marker, 'mouseover', function() {
            if (scope.selectedMovie) {
              infowindow.setContent(marker.movieInfo);
            } else {
              infowindow.setContent(marker.cinemaInfo);
            }
            infowindow.open(scope.map,marker);
          });
          google.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close(scope.map,marker);
          }); 
          google.maps.event.addListener(marker, 'click', function() {
            $rootScope.$broadcast('selectedCinema',cinema.tid);
          });                    
          
          scope.mc.addMarker(marker);
          scope.markers[cinema.tid] = marker; 
        }

        function removeMarker(tid) {
          scope.mc.removeMarker(scope.markers[tid]);
          scope.markers[tid].setMap(null);
          delete scope.markers[tid];
        }

        //watch for change in movie filter
          //if filter is set to null, fill in the cinemas not on map
          //if filter is set, remove cinemas not there, add cinemas prev removed by filter

        attrs.$observe('selectedMovie', function(value) {
          var i, cinema;
          if (!value) {
            //no selected movie - all markers should be shown
            for (i = 0; i < scope.cinemaList.length; i++) {
              cinema = scope.cinemaList[i];

              if (cinema===null) {
                continue;
              }

              if (scope.markers[cinema.tid]) {
                continue;
              } else {
                createMarker(cinema);
              }      
            }
          } else if (value) {
            //remove all cinemas that do not contain this
            for (i = 0; i < scope.cinemaList.length; i++) {
              cinema = scope.cinemaList[i];
              if (cinema===null) {
                continue;
              }

              if (!_.contains(cinema.movies, value)) {
                if (scope.markers[cinema.tid]) {
                  //REMOVE THE CINEMA
                  removeMarker(cinema.tid);
                }
              } else {
                //cinema is showing the movie - add marker or update infowindow with times
                if (!scope.markers[cinema.tid]) {
                  createMarker(cinema);
                } else {
                  updateMovieTimes(cinema);
                }
              }
            }           
          }
        });

        attrs.$observe('cinemas', function(value) {
        	value = JSON.parse(value);
          scope.cinemaList = value;

          value = _.filter(value, function(cinema) {
            if (cinema!==null) {
              return true;
            }
          });
          
        	var newCinemas = _.difference(_.pluck(value,'tid'), scope.prevTids);
        	for (var i = 0; i < newCinemas.length; i++) {
            var newCinema = _.findWhere(value, { 'tid': newCinemas[i] });

            if (attrs.selectedMovie) {
              if (!_.contains(newCinema.movies, attrs.selectedMovie)) continue;
            }

            if (newCinema===null) continue;
            createMarker(newCinema);
        	}

        	var oldCinemas = _.difference(scope.prevTids, _.pluck(value,'tid'));

        	for (var j = 0; j < oldCinemas.length; j++) {
            if (scope.markers[oldCinemas[j]]) {
              removeMarker(oldCinemas[j]);
            }
        	}

        	scope.prevTids = _.pluck(value,'tid');
        });

      }
    };
  });
