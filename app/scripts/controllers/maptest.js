'use strict';

angular.module('cinemaApp')
  .controller('MaptestCtrl', function ($scope, localStorageService, Directions) {

  	$scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 4, bounds: {}};

  	$scope.polylines = 
        [
            {
                id: 1,
                path: [
                    {
                        latitude: 45,
                        longitude: -74
                    },
                    {
                        latitude: 30,
                        longitude: -89
                    }
                ]
            }
        ];


  });
