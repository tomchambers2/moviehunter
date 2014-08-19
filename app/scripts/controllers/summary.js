'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:SummaryCtrl
 * @description
 * # SummaryCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('SummaryCtrl', function ($scope, tempData, choices, collatedata, localStorageService) {
    var postcode = tempData.getData('postcode');
    var movieChoice = choices.getData('movie');
    var dateChoice = choices.getData('date');
    $scope.dateChoice = dateChoice;
    $scope.timeChoice = choices.getData('time');

    var cinemaChoice = choices.getData('cinema');

    var cinemaList = localStorageService.get('cinemaList'+postcode);


    var collatedCinemas = [];
    var movieList = collatedata.getMovieList(postcode).list;

    var movie = movieList[movieChoice];
    $scope.movieTitle = movie.title;

    for (var i = 0;i<cinemaList.length;i+=1) {
      for (var showingAtCinemaId in movie.cinemas) {
        if (cinemaList[i].venue_id === showingAtCinemaId) {
            cinemaList[i].times = movie.cinemas[showingAtCinemaId].times;
            collatedCinemas.push(cinemaList[i]);
        }
      }
    }

    $scope.cinema = collatedCinemas[cinemaChoice];
  });
