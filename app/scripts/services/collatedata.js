'use strict';

angular.module('cinemaApp')
  .factory('collatedata', function ($rootScope, Proxy, $q, localStorageService) {

    var movies = {};
    movies.list = {};
    movies.partiallyBuilt = false;
    var pattern = /[a-zA-Z0-9'\-:& ]+/;

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
              movies.list[currentMovie.link].title = currentMovie.title.match(pattern)[0];
              movies.list[currentMovie.link].link = currentMovie.link;
            }
            if (j===0 && k===0) {
              $rootScope.$broadcast('firstFilmStored');
              movies.partiallyBuilt = true;
            }
          }          
        }
      }).then(function() {
        movies.collated = true;
        localStorageService.add('movies'+postcode, movies);
      });
    };

    return {
      createMovieList: collateMovieData,
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