'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:ChoosetimeCtrl
 * @description
 * # ChoosetimeCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('ChoosetimeCtrl', function ($scope, $location, tempData, collatedata, choices, localStorageService) {
    var postcode = tempData.getData('postcode');
    var movieChoice = choices.getData('movie');
    var dateChoice = choices.getData('date');
    $scope.dateChoice = dateChoice;
    var cinemaChoice = choices.getData('cinema');
    var cinemaList = localStorageService.get('cinemaList'+postcode);
    var collatedCinemas = [];
    var movieList = collatedata.getMovieList(postcode).list;
    var movie = movieList[movieChoice];
    $scope.movieTitle = movie.title;
    if(!postcode) {
      $location.path('/');
    }
    if (!movieChoice) {
        $location.path('/');
    }

    for (var i = 0;i<cinemaList.length;i+=1) {
      for (var showingAtCinemaId in movie.cinemas) {
        if (cinemaList[i].venue_id === showingAtCinemaId) {
            cinemaList[i].times = movie.cinemas[showingAtCinemaId].times;
            collatedCinemas.push(cinemaList[i]);
        }
      }
    }

    $scope.cinema = collatedCinemas[cinemaChoice];

    $scope.nextStep = function(time) {
    	choices.saveChoice('time',time);
    	$location.path('/summary');
    };
  });
