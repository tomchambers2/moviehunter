'use strict';

angular.module('cinemaApp')
  .controller('VideoCtrl', function ($scope, $location, $youtube, tempData, choices, Proxy, collatedata) {

    $scope.movie = {};
    $scope.loaded = false;

    $scope.playerVars = {
      autoplay: 1,
      showinfo: 0,
      controls: 0,
      iv_load_policy: 3,
    };

    var resetSummary = function() {
      $scope.movie.synopsis = 'Loading synopsis';
      $scope.movie.imdb = ' --';
      $scope.movie.rottenTomatoes = ' --';
      $scope.movie.runtime = '---';
    };
    resetSummary();

    var watchedFilms = [];
    $scope.watchedFilms = watchedFilms;

    var getRandomFilm = function(movies) {
      var keys = Object.keys(movies);
      var keyCount = keys.length;
      var candidate;

      if (watchedFilms.length >= keyCount) {
        watchedFilms = [];
        return null;
      }

      while (true) {
        candidate = movies[keys[Math.floor(Math.random() * keyCount)]];
        if (watchedFilms.indexOf(candidate) === -1) {
          watchedFilms.push(candidate);
          return candidate;
        }
      }
    };

    var showFilm = function() {
      var movie = getRandomFilm(collatedata.getMovieList(postcode).list);
      $scope.movie.movieTitle = movie.title;
      resetSummary();
      choices.saveChoice('movie',movie.link);
      getYoutubeData(movie.title);
      getImdbDetails(movie.title);
      getRtDetails(movie.title);
    };

    $scope.showFilm = showFilm;

    var setLoadedTrue = function() {
      $scope.loaded = true;
      $scope.$broadcast('loaded');
    };

    var getYoutubeData = function(title) {
      var pattern = /[a-zA-Z0-9'\-:& ]+/;
      var title = title.match(pattern)[0];
      var youtubeUrl = 'https://www.googleapis.com/youtube/v3/';
      var path = encodeURIComponent('search?part=id%2Csnippet&q='+title+'%20movie%20trailer&key=AIzaSyBSLdvbrkkvY7Ft9ZYhgUqoSoBlak2A9HY');
      var wholeyoutubeUrl = youtubeUrl + path;
      Proxy.get(wholeyoutubeUrl).then(function(result) {   
        $scope.yId = result.items[0].id.videoId;
        setLoadedTrue();
      });
    };

    var getRtDetails = function(title) {
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
          $scope.movie.rt = rt;
        }
        //return rt;
      });
    };

    var getImdbDetails = function(movieTitle) {
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
        $scope.movie.imdb = imdb;
        //return imdb;
      });
    };

    $scope.$on('youtube.player.paused', function() {
      $scope.videoPaused = true;
    });
    $scope.$on('youtube.player.playing', function() {
      $scope.videoPaused = false;
    });

    $scope.controlVideo = function() {
      if ($scope.videoPaused===true) {
        $scope.videoPaused=false;
        $youtube.player.playVideo();
      } else {
        $scope.videoPaused=true;
        $youtube.player.pauseVideo();
      }
    };

    //get postcode -> check if first result in -> check if started at all -> if not kick back to home
    var postcode = tempData.getData('postcode');
    if (!postcode) {
      $location.path('/');
    }
    if (!collatedata.getMovieList(postcode).partiallyBuilt) {
      if (!collatedata.getMovieList(postcode).startedBuilding) {
        $location.path('/');
      }
      $scope.$on('firstFilmStored', function() {
        showFilm();
      });
    } else {
      showFilm();
    }
  });