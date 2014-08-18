'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:ChoosedateCtrl
 * @description
 * # ChoosedateCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('ChoosedateCtrl', function ($scope, $location, tempData, collatedata, choices) {
    var postcode = tempData.getData('postcode');
    if(!postcode) {
      $location.path('/');
    }
  	var movieChoice = choices.getData('movie');
  	if (!movieChoice) {
  		$location.path('/');
  	};

    var movieList = collatedata.getMovieList(postcode).list;
    var movie = movieList[movieChoice];
    $scope.movieTitle = movie.title;
    $scope.cinemas = movie.cinemas;

    var createDays = function(numberOfDays) {
      var days = [];
      numberOfDays = numberOfDays || 7;
      var time = new Date().getTime();
      for (var i = 0; i < numberOfDays + 1; i += 1) {
        var day = time + ((60 * 60 * 24)*1000 * i);
        days.push(day);
      }
      return days;
    };
    $scope.availableDays = createDays(5);

  	$scope.pickDate = function(date) {
  		choices.saveChoice('date',date);
  		$location.path('/pickcinema');
  	};
  });
