'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:PickcinemaCtrl
 * @description
 * # PickcinemaCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('PickcinemaCtrl', function ($scope, $location, $q, localStorageService, tempData, choices, collatedata, Geocoder, Directions) {    
    //I bet there's a way to do all this checking in app.js...
    var postcode = tempData.getData('postcode');
    var latlong = tempData.getData('latlong');
    if(!postcode) {
      postcode = 'SE163TL'
      //$location.path('/');
    }
    if (!latlong) {
      latlong = {lat: 51.4950769, lng: -0.07105039999999008};
    }
    var movieChoice = choices.getData('movie');
    if (!movieChoice) {
      $location.path('/');
    };
    var dateChoice = choices.getData('date');
    $scope.dateChoice = dateChoice;
    if (!dateChoice) {
      $location.path('/choosedate');
    }

    $scope.drawPolyline = function(cinemaIndex) {
        $scope.polylines = 
        [
            {
                id: 1,
                path: google.maps.geometry.encoding.decodePath(collatedCinemas[cinemaIndex].polyline),
                stroke: {
                  color: '#9E0326'
                }
            }
        ];
    }

    $scope.nextStep = function(index) {
      choices.saveChoice('cinema',index);
      $location.path('/summary');
    }

    Geocoder.latLngForAddress(postcode).then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    });

    var cinemaList = localStorageService.get('cinemaList'+postcode);

    var movieList = collatedata.getMovieList(postcode).list;
    var movie = movieList[movieChoice];
    $scope.movieTitle = movie.title;

    var collatedCinemas = [];

    for (var i = 0;i<cinemaList.length;i+=1) {
      for (var showingAtCinemaId in movie.cinemas) {
        if (cinemaList[i].venue_id === showingAtCinemaId) {
            cinemaList[i].times = movie.cinemas[showingAtCinemaId].times;
            collatedCinemas.push(cinemaList[i]);
        }
      }
    }

    $scope.cinemaMarkers = [];
    var promises = [];

    for (var j = 0;j<collatedCinemas.length;j+=1) {
      var coords = collatedCinemas[j].coords;
      promises.push(Directions.doRequest({lat:coords.lat,lng:coords.lng},{lat:latlong.lat,lng:latlong.lng}));
      var map_coords = {
        id: j,
        title: collatedCinemas[j].title,
        clickable: false,
        latitude: collatedCinemas[j].coords.lat,
        longitude: collatedCinemas[j].coords.lng,
        icon: '/images/cinema_icons/cinema.png'
      }
      $scope.cinemaMarkers.push(map_coords);
    };

    $q.all(promises).then(function(response) {
      for (var k = 0;k<collatedCinemas.length;k+=1) {
        collatedCinemas[k].polyline = response[k].routes[0].overview_polyline;
      };
      }, function(response) {
        throw new Error(response);
      });

    $scope.collatedCinemas = collatedCinemas;

  	$scope.map = {
      center: {
        latitude: latlong.lat,
        longitude: latlong.lng
      },
        zoom: 12
      };

    var home_marker = {
      id: 300,
      latitude: latlong.lat,
      longitude: latlong.lng
    }
    $scope.cinemaMarkers.push(home_marker);


  });
