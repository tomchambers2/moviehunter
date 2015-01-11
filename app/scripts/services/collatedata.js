'use strict';

angular.module('cinemaApp')
  .factory('collatedata', function ($rootScope, Proxy, $q, localStorageService, getMovieData) {

    var movies = {};
    movies.list = {};
    movies.partiallyBuilt = false;
    var pattern = /[a-zA-Z0-9'\-:& ]+/;

    var getCinemaData = function(postcode) {
      var cinemas = 'http://moviesapi.herokuapp.com/cinemas/find/'+postcode;
      Proxy.get(cinemas).then(function (result) {
        var promises = [];

        for (var i = 0;i<result.length;i+=1) {
          promises.push(Geocoder.latLngForAddress(result[i].address));
        }
        console.log(promises)
        $q.allComplete(promises).then(function(coords) {
            for (var j = 0;j<coords.length;j+=1) {
                if (coords[j].lat && coords[j].lng) {
                  //var shortName = /(Showcase|Odeon|Cineworld|Reel)/.exec(result[j].title);
                  //var icon = shortName ? shortName[0] : 'cinema';
                  var map_coords = {
                    id: j,
                    title: result[j].title,
                    clickable: false,
                    latitude: coords[j].lat,
                    longitude: coords[j].lng,
                    icon: 'images/cinema_icons/cinema.png'
                  };
                  $scope.cinemaMarkers.push(map_coords);
                  cinemaList = result;
                  cinemaList[j].coords = coords[j];
                }
            }
            localStorageService.add('cinemaList'+postcode,cinemaList);
            $scope.loading = 2; //when all is done, let the user click next. stop loading. only when all has returned!
        }, function(error) {
          console.log("Failed to get cinema coordinates",error.type,error.message);
        });
        collatedata.createMovieList(result, postcode);
      });      
    }

    var collateMovieData = function(cinemas, postcode) {
      movies.startedBuilding = true;
      console.log('Loading movie data in the background');
      
      var promises = [];
      for (var i = 0;i < cinemas.length; i+=1) {
        var movie_data = 'http://moviesapi.herokuapp.com/cinemas/'+cinemas[i].venue_id+'/showings';
        var promise = Proxy.get(movie_data);
        promises.push(promise);
      }

      $q.all(promises).then(function(result) {
        for (var j = 0; j < result.length; j += 1) { //iterate through promises, which is an array of cinemas
          var currentCinema = cinemas[j];
          var cinemaResult = result[j];

          for (var k = 0; k < cinemaResult.length; k += 1) { //iterate through the films, repeated for each cinema
            var currentMovie = cinemaResult[k];
            if (movies.list[currentMovie.link]) {
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id] = {};
              var info = [
                currentCinema.title,
                currentCinema.distance,
                currentCinema.address,
                currentCinema.link
              ];
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id].info = info; //title, distance, address, link, venueid
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id].times = currentMovie.time;
            } else {
              movies.list[currentMovie.link] = {};
              movies.list[currentMovie.link].cinemas = {};
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id] = {};
              var info = [
                currentCinema.title,
                currentCinema.distance,
                currentCinema.address,
                currentCinema.link
              ];
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id].info = info; //title, distance, address, link, venueid
              movies.list[currentMovie.link].cinemas[currentCinema.venue_id].times = currentMovie.time;
              console.log(currentMovie.title);
              movies.list[currentMovie.link].title = currentMovie.title.match(pattern)[0];
              movies.list[currentMovie.link].link = currentMovie.link;

              applyMovieData(currentMovie.link,currentMovie.title.match(pattern)[0]);
            }

            
            if (movies.partiallyBuilt === false) {
              $rootScope.$broadcast('firstFilmStored');
              console.log('setting partiallyBuilt to true!!!')
              movies.partiallyBuilt = true;
            }
          }          
        }
      }).then(function() {
        movies.collated = true;
        localStorageService.add('movies'+postcode, movies);
      });
    };

    var applyMovieData = function(link,title) {
      getMovieData.getData(title).then(function(details) {
        movies.list[link].details = details;
        localStorageService.add('movies'+postcode, movies);
      });
    }    

    return {
      createMovieList: collateMovieData,
      movieList: movies.list,
      getMovieList: function(postcode) {
          if (localStorageService.get('movies'+postcode)) {
            console.log('Getting cached data instead. update this to check for staleness');
            return localStorageService.get('movies'+postcode);
          } else {
            return movies;
          }
      }
    };

  });