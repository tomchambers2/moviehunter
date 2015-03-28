'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:markers
 * @description
 * # markers
 */
angular.module('cinemaApp')
  .directive('markers', ['$compile','$rootScope', function($compile, $rootScope) {
    return {
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      	scope.markers = {};
      	scope.prevTids = [];

        var ICON_PATH = '/images/cinema_icons/cinema.png';
        var DISABLED_ICON_PATH = '/images/cinema_icons/cinema_disabled.png';

        function updateMovieTimes(cinema) {
          var movie = _.findWhere(scope.movies, { id: scope.selectedMovie });
          var date = scope.selectedDay;
          var movieTimes = [];
          movieTimes.push('<strong>Showtimes for '+moment(date).format('dddd')+'</strong>');
          if (!movie[cinema.tid][date]) {
            movieTimes.push('<strong>Not showing here on '+moment(date).format('dddd')+'</strong>');
          } else {
            movieTimes.push(movie[cinema.tid][date].times.join(', '));
          }

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
              icon: ICON_PATH
          });
          
          //// SCHEDULED FOR DEMOLITION, PLEASE REMOVE STUFF THAT IS ABOUT PARSING JSON
          var movies = scope.movies;
          ////

          cinema.movieDetails = [];
          cinema.movieTimes = [];

          if (cinema.movies) {
            var movie;
            if (attrs.selectedMovie) {
              movie = _.findWhere(movies, { id: attrs.selectedMovie });
              var date = scope.selectedDay;
              cinema.movieTimes.push('Showtimes for '+moment(date).format('dddd'));
              if (!movie[cinema.tid][date]) {
                cinema.movieTimes.push('<strong>Not showing here on '+moment(date).format('dddd')+'</strong>');
              } else {
                cinema.movieTimes.push(movie[cinema.tid][date].times.join(', '));
              }         
            }

            for (var i = 0; i < cinema.movies.length; i++) {
              //console.log('looking for',cinema.movies[i]);
              movie = _.findWhere(movies, { id: cinema.movies[i] });
              if (!movie) continue;
              cinema.movieDetails.push('<a ng-click="filterCinemas({ movie: \''+cinema.movies[i]+'\', cinema: \''+cinema.tid+'\', updateUrl: true })">'+movie.title+'</a>');
            }
          }

          marker.movieInfo = '<div><strong>'+cinema.title+'</strong><br><i><a ng-click="selectCinema({ tid: \''+cinema.tid+'\', dontReset: true })">Filter by this cinema</a></i><ul class="movie-list"><li>'+cinema.movieTimes.join('</li><li>')+'</li></ul></div>';
          marker.cinemaInfo = '<div><strong>'+cinema.title+'</strong><br><i><a ng-click="selectCinema({ tid: \''+cinema.tid+'\', dontReset: true })">Filter by this cinema</a></i><ul class="movie-list"><li>'+cinema.movieDetails.join('</li><li>')+'</li></ul></div>';

          var infowindow = new google.maps.InfoWindow({
              maxWidth: 230,
              disableAutoPan : true
          });

          google.maps.event.addListener(marker, 'click', function() {
            if (scope.selectedMovie) {
              var compiled = $compile(marker.movieInfo)(scope); 
              infowindow.setContent(compiled[0]);
            } else {
              var compiled = $compile(marker.cinemaInfo)(scope); 
              infowindow.setContent(compiled[0]);
            }
            infowindow.open(scope.map,marker);
          });
          // google.maps.event.addListener(marker, 'click', function() {
          //   $rootScope.$broadcast('selectedCinema',cinema.tid);
          // });                    
          
          scope.mc.addMarker(marker);
          scope.markers[cinema.tid] = marker; 
        }

        function removeMarker(tid) {
          scope.mc.removeMarker(scope.markers[tid]);
          scope.markers[tid].setMap(null);
          delete scope.markers[tid];
        }

        function bounceMarker(tid) {
          scope.markers[tid].setAnimation(google.maps.Animation.BOUNCE);
        }
        function stopBouncing(tid) {
          scope.markers[tid].setAnimation(null);
        }
        $rootScope.$on('bounce', function(event, tid) {
          bounceMarker(tid);
        });
        $rootScope.$on('stopBounce', function(event, tid) {
          stopBouncing(tid);
        });


        function updateMarkerIcon(tid, state) {
          if (!scope.markers[tid]) {
            console.error(tid,'does not exist');
            return;
          }
          if (state==='default') {
            scope.markers[tid].setIcon(ICON_PATH);
          } else if (state==='disabled') {
            scope.markers[tid].setIcon(DISABLED_ICON_PATH);
          }
        }

        function updateCinemaIcons(moviename) {
          moviename = moviename || scope.filters.moviename;

          if (moviename === '') {
            for (var i = 0; i < scope.cinemas.length; i++) {
              updateMarkerIcon(scope.cinemas[i].tid, 'default');
            };
            return;
          }

          var filteredMovies = _.filter(scope.movies, function(movie) {
            var title = movie.title.toLowerCase();
            if (title.indexOf(moviename.toLowerCase())>-1) {
              return true;
            }
          });

          for (var i = 0; i < scope.cinemas.length; i++) {
            for (var j = 0; j < filteredMovies.length; j++) {
              if (scope.cinemas[i].movies.indexOf(filteredMovies[j].id)>-1) {
                updateMarkerIcon(scope.cinemas[i].tid, 'default');
              } else {
                updateMarkerIcon(scope.cinemas[i].tid, 'disabled');
              }
            };
          };          
        }

        scope.$watch('filters.moviename', function(moviename) {
          updateCinemaIcons();
        });

        scope.$watch('selectedMovie', function(value, oldValue) {
          var i, cinema;

          if (oldValue === value) return; //if its not changed, don't bother doing anything

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

            updateCinemaIcons();          
          }
        });

        scope.$watch('cinemas', function(value) {
        	//value = JSON.parse(value);
          scope.cinemaList = value;
         //scope.cinemaList = cinemas; //MAKE CONSISTENT WITH MAIN SCOPE CINEMAS? WHY CINEMALIST?

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

          updateCinemaIcons();
        }, true);

      }
    };
  }]);
