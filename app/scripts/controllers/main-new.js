'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainNewCtrl
 * @description
 * # MainNewCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('MainNewCtrl', function ($scope, $location, $q, $timeout, Proxy, Geocoder, tempData, choices, localStorageService, collatedata, $youtube) {

  $scope.mapEvents = {
    tilesloaded: function (map) {
      $scope.$apply(function () {
        $scope.mapInstance = map;
      });
    },
    dragend: function(event) {
      $scope.showSearchResults(event.center.k, event.center.D);
    }
  };

  $scope.playerVars = {
    autoplay: 1,
    showinfo: 0,
    controls: 0,
    iv_load_policy: 3,
  };  

  $scope.events = {
    click: function(marker, eventName, model) {
      filterMovieList(model.id);
      $scope.filtered = true;
    }
  };        

  var setMap = function(latitude, longitude) {
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
      }
    };
  };
  setMap();

  $scope.cinemaMarkers = [];    


  /* interactions */
  var filterMovieList = function(venue_id) {
    if ($scope.storedMovieList) {
      var movieList = $scope.storedMovieList;
    } else {
      $scope.storedMovieList = $scope.movieList;
    }

    $scope.movieList = _.filter(movieList, function(movie) {
      var cinemas = _.keys(movie.cinemas);
      if (_.contains(cinemas,venue_id)) {
        return true;
      };
    });    
  }

  $scope.highlightCinemas = function(cinemas) {
  	var postcode = tempData.getData('postcode');
  	var cinemaList = localStorageService.get('cinemaList'+postcode);

  	var filteredCinemas = _.filter(cinemaList, function(cinema) {
  		return _.contains(_.keys(cinemas), cinema.venue_id);
    });



    createCinemaMarkers(filteredCinemas);
  };

  $scope.resetCinemas = function() {
    $scope.cinemaMarkers = $scope.fullCinemaMarkers;
  };    

  $scope.openTrailer = function(youtubeId) {
    $scope.youtubeId = youtubeId;
  };

  $scope.closeTrailer = function() {
    $scope.youtubeId = null;
  };

  $scope.resetFilter = function() {
    $scope.movieList = $scope.storedMovieList;
    $scope.filtered = false;
  }; 

  // doSearch -> getLatLng -> get results for lat,lng -> get movie list
  //                           (turn into postcode)

  var createCinemaMarkers = function(cinemas) {
    $scope.cinemaMarkers = [];
    for (var i = 0; i < cinemas.length; i++) {
      var map_coords = {
        id: cinemas[i].venue_id,
        title: cinemas[i].title,
        options: {
          title: cinemas[i].title
        },
        clickable: true,
        latitude: cinemas[i].coords.lat,
        longitude: cinemas[i].coords.lng,
        icon: 'images/cinema_icons/cinema.png'
      }
      $scope.cinemaMarkers.push(map_coords);
    };
  };

  /* youtube player control */
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

  /* search functions */
  $scope.doSearch = function() {
    $scope.searching = 1;
    Geocoder.latLngForAddress($scope.address).then(function(coords) {
        $scope.showSearchResults(coords.lat,coords.lng);
    }, function(err) {
        $scope.loading=0;
    });
  };

  var coordsIntoPostcode = function(latitude,longitude) {
    var deferred = $q.defer();
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

  var getCachedCinemas = function(postcode) {
    var cinemaList = localStorageService.get('cinemaList'+postcode);

    createCinemaMarkers(cinemaList);

    $scope.fullCinemaMarkers = _.clone($scope.cinemaMarkers, true);
    if (!collatedata.getMovieList(postcode)) {
      collatedata.createMovieList(localStorageService.get('cinemaList'+postcode), postcode);
    } else {
      $scope.movieList = collatedata.getMovieList(postcode).list;
    }
    $scope.loading = 2;    
  }

  $scope.showSearchResults = function(latitude,longitude) {
    coordsIntoPostcode(latitude,longitude).then(function(postcode) {
      setMap(latitude,longitude);
      $scope.loading = 1;
      $scope.searching = 0;

      if (localStorageService.get('cinemaList'+postcode)) {
        getCachedCinemas(postcode);
        return;
      }

      var cinemas = 'http://moviesapi.herokuapp.com/cinemas/find/'+postcode;
      Proxy.get(cinemas).then(function (result) {
        var promises = [];

        for (var i = 0;i<result.length;i+=1) {
          promises.push(Geocoder.latLngForAddress(result[i].address));
        }
        $q.allComplete(promises).then(function(coords) {
            for (var j = 0;j<coords.length;j+=1) {
              result[j].coords = coords[j];
            };
            cinemaList = result;

            createCinemaMarkers(cinemaList);

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
  });
