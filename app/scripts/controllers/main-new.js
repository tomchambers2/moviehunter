'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainNewCtrl
 * @description
 * # MainNewCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('MainNewCtrl', function ($scope, $location, $q, $timeout, Proxy, Geocoder, tempData, choices, localStorageService, collatedata) {
    $scope.highlightCinemas = function(cinemas) {
    	var postcode = tempData.getData('postcode');
    	var cinemaList = localStorageService.get('cinemaList'+postcode);

    	var filteredCinemas = _.filter(cinemaList, function(cinema) {
    		return _.contains(_.keys(cinemas), cinema.venue_id);
    	});

		$scope.cinemaMarkers = [];
    	for (var i = 0; i < filteredCinemas.length; i++) {
		    var map_coords = {
		      id: i,
		      title: filteredCinemas[i].title,
		      options: {
		      	title: filteredCinemas[i].title
		      },
		      clickable: false,
		      latitude: filteredCinemas[i].coords.lat,
		      longitude: filteredCinemas[i].coords.lng,
		      icon: 'images/cinema_icons/cinema.png'
		    };
		    $scope.cinemaMarkers.push(map_coords);
    	};
    	console.log($scope.cinemaMarkers);
    };

    $scope.resetCinemas = function() {
    	console.log('killing this')
		$scope.cinemaMarkers = $scope.fullCinemaMarkers;
    };

    $scope.doSearch = function() {
      $scope.searching = 1;
      console.log('will search for',$scope.address)
      Geocoder.latLngForAddress($scope.address).then(function(coords) {
          $scope.showSearchResults(coords.lat,coords.lng);
      }, function(err) {
      	console.log("address not found",err)
          $scope.loading=0;
      });
    };

    var coordsIntoPostcode = function(latitude,longitude) {
      var deferred = $q.defer();
      //var url = 'http://uk-postcodes.com/latlng/'+latitude+','+longitude+'.json';
      var url = 'https://api.postcodes.io/postcodes/lon/'+longitude+'/lat/'+latitude;
      Proxy.get(url).then(function (data) {
        if (!data.result) {          
          stopSearching();
          $scope.loading=0;
          deferred.reject();
          throw new Error('Postcode API returned blank');
        } else {
          var postcode = data.result[0].outcode + ' ' + data.result[0].incode;          
          if ($scope.usedGeolocation===true) {
            $scope.address = postcode;
          }
          $scope.loading=1;
          $scope.postcode = postcode;
          postcode = postcode.split(' ').join('');
          tempData.saveData('postcode', postcode);
          choices.saveChoice('postcode', postcode);
          tempData.saveData('latlong', {lat:latitude,lng:longitude});
          deferred.resolve(postcode);
        } 
      });
      return deferred.promise;
    };

    $scope.showSearchResults = function(latitude,longitude) {
      coordsIntoPostcode(latitude,longitude).then(function(postcode) {
        setMap(latitude,longitude);
        $scope.loading = 1;
        $scope.searching = 0;

        if (localStorageService.get('cinemaList'+postcode)) {
          console.log('using cached list');
          var cinemaList = localStorageService.get('cinemaList'+postcode);
          for (var a = 0;a<cinemaList.length;a+=1) {
            var map_coords = {
              id: a,
              title: cinemaList[a].title,
              clickable: false,
              latitude: cinemaList[a].coords.lat,
              longitude: cinemaList[a].coords.lng,
              icon: './images/cinema_icons/cinema.png'
            };
            $scope.cinemaMarkers.push(map_coords);
          }
          $scope.fullCinemaMarkers = _.clone($scope.cinemaMarkers, true);
          if (!collatedata.getMovieList(postcode)) {
            collatedata.createMovieList(localStorageService.get('cinemaList'+postcode), postcode);
          } else {
          	$scope.movieList = collatedata.getMovieList(postcode).list;
          	console.log('cached movies',$scope.movieList)
          }
          $scope.loading = 2;
          return;
        }

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
                    console.log('new cinema list',$scope.cinemaMarkers);
                    cinemaList = result;
                    cinemaList[j].coords = coords[j];
                  }
              }
              $scope.fullCinemaMarkers = _.clone($scope.cinemaMarkers, true);
              localStorageService.add('cinemaList'+postcode,cinemaList);
              $scope.loading = 2; //when all is done, let the user click next. stop loading. only when all has returned!
          }, function(error) {
            console.log("Failed to get cinema coordinates",error.type,error.message);
          });
          collatedata.createMovieList(result, postcode);
          $scope.movieList = collatedata.movieList;
          console.log($scope.movieList)
        });
      }, function() {
        console.log('We got an error with the postcode');
      });
    };

	$scope.films = [1,2,3,4]

	  $scope.map = {
	    center: {
	      latitude: 51,
	      longitude: 50
	    },
	    zoom: 12,
	    draggable: true
	  };

	  $scope.marker = {
	    id: 0,
	    coords: {
	      latitude: 51,
	      longitude: 50
	    },
	    options: { 
	      draggable: true,
	      visible: true,
	      title: '"There\'s no place like home"',
	      zIndex: 1000
	    },
	    events: {
	      dragend: function (marker) {
	        coordsIntoPostcode(marker.getPosition().lat(),marker.getPosition().lng());
	      }
	    }
	  };

    var setMap = function(latitude, longitude) {
      console.log('will set map to ',latitude,' ',longitude);
      latitude = latitude ? latitude : 51.5000;
      longitude = longitude ? longitude : 0.1167;
      $scope.map = {
        center: {
          latitude: latitude,
          longitude: longitude
        },
        zoom: 12
      };
      $scope.marker = {
        id: 0,
        coords: {
          latitude: latitude,
          longitude: longitude
        },
        options: { 
          draggable: true,
          visible: true,
          title: '"There\'s no place like home"',
          zIndex: 1000
        },
        events: {
          dragend: function (marker) {
            coordsIntoPostcode(marker.getPosition().lat(),marker.getPosition().lng());
          }
        }
      };

    };
    $scope.cinemaMarkers = [];	    
  });
