'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('MainCtrl', function ($scope, Proxy) {
  	//$scope.returned = Getdetails;


  	$scope.location = 'Not found yet';

  	$scope.showPosition = function(pos) {
  		var latitude = pos.coords.latitude;
  		var longitude = pos.coords.longitude;

  		$scope.location = 'Your location is '+latitude+longitude;

  		var url = 'http://uk-postcodes.com/latlng/'+latitude+','+longitude+'.json';
  		console.log(url);
  		var results = Proxy.get(url);

  		results.then(function (data) {
  			var postcode = data.postcode ? data.postcode : 'DE742LP';
  			$scope.location = 'Your postcode is '+postcode;
  			console.log(data);
	  	});

  		//go to point on the map at those coords

  		//display the modal for where you are - your postcode - allow it to proceed to next step, or automatically do it

  		$scope.$digest();
  	};

  	$scope.getLocation = function() {
  		$scope.location = 'currently finding';
  		console.log('getting called');
  		if (navigator.geolocation) {
  			navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
  		} else {
  			console.log('This browser doesn\'t support geolocation. Produce error');
  		}
  	};
  });