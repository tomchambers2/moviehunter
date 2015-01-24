'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainNewCtrl
 * @description
 * # MainNewCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('MainNewCtrl', function ($scope, $location, $q, $timeout, Proxy, Geocoder, tempData, choices, localStorageService, collatedata, geolocation) {

    var timeouts = {
      map: []
    };


    $scope.mapEvents = {
      tilesloaded: function (map) {
        $scope.$apply(function () {
          $scope.mapInstance = map;
        });
      },
      dragend: function(event) {
        for (var i = 0; i < timeouts.map.length; i++) {
          $timeout.cancel(timeouts.map[i]);
        };

        var timeout = $timeout(function() {
          $scope.showSearchResults(event.center.k, event.center.D);
        }, 700);

        timeouts.map.push(timeout);
      }
    };

    $scope.playerVars = {
      autoplay: 1,
      showinfo: 0,
      controls: 0,
      iv_load_policy: 3,
      rel: 0,
      modestbranding: 1
    };  

    $scope.youtubePlayer = {
      player: null
    };

    $scope.events = {
      click: function(marker, eventName, model) {
        filterMovieList(model.id);
        $scope.filtered = true;
      }
    };        

    var setMap = function(latitude, longitude) {
      latitude = latitude ? latitude : 51.5000;
      longitude = longitude ? longitude : -0.1167;

      $scope.map = {
        center: {
          latitude: latitude,
          longitude: longitude
        },
        zoom: 11       
      };

      $scope.map = {
        center: {
          latitude: latitude,
          longitude: longitude
        },
        zoom: 11       
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
      for (var id in $scope.movieList) {
        var chosenCinema = $scope.movieList[id].cinemas[venue_id];
        $scope.movieList[id].chosenCinemaTimes = null;
        $scope.movieList[id].chosenCinema = null;
      }

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

      for (var id in $scope.movieList) {
        var chosenCinema = $scope.movieList[id].cinemas[venue_id];
        $scope.movieList[id].chosenCinemaTimes = chosenCinema.times;
        $scope.movieList[id].chosenCinema = chosenCinema.info[0];
      }
    };

    $scope.resetCinemas = function() {
      $scope.cinemaMarkers = $scope.fullCinemaMarkers;
      $scope.filterOptions = {
        filtered: false,
        movie: null
      }
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

    $scope.highlightCinemas = function(cinemas, movie) {
      var postcode = tempData.getData('postcode');
      var cinemaList = localStorageService.get('cinemaList'+postcode);

      $scope.filterOptions = {
        filtered: true,
        movie: movie.title
      }

      var filteredCinemas = _.filter(cinemaList, function(cinema) {
        return _.contains(_.keys(cinemas), cinema.venue_id);
      });

      for (var i = 0; i < filteredCinemas.length; i++) {
        filteredCinemas[i].movieTimes = movie.cinemas[filteredCinemas[i].venue_id].times;
        filteredCinemas[i].movieTitle = movie.title;
      };

      createCinemaMarkers(filteredCinemas);
    };  

    var getMoviesForCinema = function(venue_id) {
      console.log($scope.movieList);
      var movieList = _.filter($scope.movieList, function(movie) {
        var cinemas = _.keys(movie.cinemas);
        if (_.contains(cinemas,venue_id)) {
          return true;
        };
      });
    };

    var createCinemaMarkers = function(cinemas) {
      $scope.cinemaMarkers = [];
      $scope.cinemaWindows = [];
      $scope.cinemaInfo = {};
      for (var i = 0; i < cinemas.length; i++) {
        
        getMoviesForCinema(cinemas[i].venue_id);

        var map_coords = {
          id: cinemas[i].venue_id,
          title: cinemas[i].title,
          options: {
            title: cinemas[i].title,
            random: 'blah blah blah'
          },
          clickable: true,
          latitude: cinemas[i].coords.lat,
          longitude: cinemas[i].coords.lng,
          icon: 'images/cinema_icons/cinema.png'
        }

        if (!cinemas[i].movieTitle) {
          cinemas[i].movieTitle = '';
        }

        $scope.cinemaInfo[cinemas[i].venue_id] = {};
        $scope.cinemaInfo[cinemas[i].venue_id].movieTitle = cinemas[i].movieTitle;
        $scope.cinemaInfo[cinemas[i].venue_id].movieTimes = cinemas[i].movieTimes;

        var parameters = {
            movieTitle: cinemas[i].movieTitle,
            movieTimes: cinemas[i].movieTimes,
            stuff: 'from props'
        }

        var window = {
          id: cinemas[i].venue_id,
          coords: {
            latitude: cinemas[i].coords.lat,
            longitude: cinemas[i].coords.lng
          },
          options: {
            title: "I AM TITLE"
          },
          show: true,
          templateUrl: 'views/info-window.html',
          templateParameter: parameters,
          isIconVisibleOnClick: true,
          closeClick: 'none'
        }
      
      $scope.cinemaWindows.push(window);      
      $scope.cinemaMarkers.push(map_coords);
      }
      console.log($scope.cinemaWindows);
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
        $scope.youtubePlayer.player.playVideo();
      } else {
        $scope.videoPaused=true;
        $scope.youtubePlayer.player.pauseVideo();
      }
    };  

    /* geolocation */
    if (navigator.geolocation) {
      $scope.geolocationFeature = true;
    }

    $scope.getLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        $scope.searching=1;
        $scope.address='Finding your address automatically...';
      } else {
        console.log('Geolocation is not available in this browser, please type your postcode manually');
      }
    };

    var showPosition = function(pos) {
      $scope.searching=1;
      var latitude = pos.coords.latitude;
      var longitude = pos.coords.longitude;
      $scope.usedGeolocation = true;
      $scope.showSearchResults(latitude, longitude);
    };

    var showError = function() {
      console.log('Geolocation failed or permission was denied');
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

    var stopSearching = function() {
      $scope.loading=0;
    };

    var coordsIntoPostcode = function(latitude,longitude) {
      var deferred = $q.defer();
      var url = 'https://api.postcodes.io/postcodes/lon/'+longitude+'/lat/'+latitude+'&radius=999';
      console.log('url',url);
      Proxy.get(url).then(function (data) {
        if (!data.result) {          
          stopSearching();
          $scope.loading=0;
          deferred.reject();
          throw new Error('Postcode API returned blank with data:',data);
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
      console.log('searching',latitude,longitude);
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
              var cinemaList = result;

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

    var getLocationByIp = function() {
      geolocation.get().then(function(coords) {
        $scope.showSearchResults(coords.latitude, coords.longitude)
      });
    } 

    getLocationByIp();


    var latitude = latitude ? latitude : 51.5000;
    var longitude = longitude ? longitude : -0.1167;
    $scope.showSearchResults(latitude, longitude);
  });
