'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.getMovieData
 * @description
 * # getMovieData
 * Factory in the cinemaApp.
 */
angular.module('cinemaApp')
  .factory('getMovieData', function (Proxy, $q) {
    var getYoutubeData = function(title) {
      var pattern = /[a-zA-Z0-9'\-:& ]+/;
      var title = title.match(pattern)[0];
      var youtubeUrl = 'https://www.googleapis.com/youtube/v3/';
      var path = encodeURIComponent('search?part=id%2Csnippet&q='+title+'%20movie%20trailer&key=AIzaSyBSLdvbrkkvY7Ft9ZYhgUqoSoBlak2A9HY');
      var wholeyoutubeUrl = youtubeUrl + path;
      Proxy.get(wholeyoutubeUrl).then(function(result) {
         
        
      });
    };

    var info = {};

    var getRtDetails = function(title) {
    	var deferred = $q.defer();

      var pattern = /[a-zA-Z0-9'\-:& ]+/;
      var title = title.match(pattern)[0];
      var rtData = 'http://api.rottentomatoes.com/';
      var rtDataPath = encodeURIComponent('api/public/v1.0/movies.json?apikey=cbjztdb4a23whxw8maup8ne5&q='+title);
      Proxy.get(rtData + rtDataPath).then(function (result) {
        if (result.movies[0]) {
          var rt = {};
          rt.runtime = result.movies[0].runtime;
          rt.rating = result.movies[0].ratings.critics_score >= 0 ? result.movies[0].ratings.critics_score : ' --';
          rt.rtId = result.movies[0].id;
          
          var posterLink = result.movies[0].posters.thumbnail;
          rt.poster = posterLink.replace(/_tmb/i, '_pro');

         	deferred.resolve(rt); 
        }
      });

      return deferred.promise;
    };

    var getImdbDetails = function(movieTitle) {
    	var deferred = $q.defer();

      var pattern = /[a-zA-Z0-9'\-:& ]+/;
      var title = movieTitle.match(pattern)[0];
      var imdbData = 'http://omdbapi.com/?t=';
      var imdbDataPath = encodeURIComponent(title);
      Proxy.get(imdbData + imdbDataPath).then(function (result) {
        var imdb = {};
        imdb.rating = result.imdbRating;
        if (!result.imdbRating) { imdb.rating = ' --' } else { imdb.rating = (result.imdbRating === 'N/A' || '') ? ' --' : result.imdbRating; };
        imdb.actors = result.Actors;
        imdb.genre = result.Genre;
        imdb.imdbId = result.imdbID;
        imdb.synopsis = result.Plot === 'N/A' || '' ? 'No summary available' : result.Plot; 
        
        deferred.resolve(imdb);
      });

      return deferred.promise;
    };

    var getData = function(title) {
    	var deferred = $q.defer();

    	var promises = [getImdbDetails(title),getRtDetails(title)];

    	$q.allComplete(promises).then(function(data) {
    		var details = {
    			imdb: data[0],
    			rt: data[1]
    		};
    			
    		deferred.resolve(details);
    	});

    	return deferred.promise;
    }

    return {
      getData: getData
    };
  });
