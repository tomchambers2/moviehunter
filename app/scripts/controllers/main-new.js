'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainNewCtrl
 * @description
 * # MainNewCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('MainNewCtrl', function ($scope, $location, $routeParams, $q, $timeout, Proxy, Geocoder, tempData, choices, localStorageService, collatedata, geolocation) {

  var timeouts = {
    map: []
  }

  $scope.filters = {
    moviename: ''
  }
  $scope.movieList = {};

var sortByRtRating = function(item) {
  if (!item.details) return -1;
  if (typeof item.details.rt.rating != 'number')
    return -1;
  return item.details.rt.rating;
}  

var sortByImdbRating = function(item) {
  if (!item.details) return -1;
  if (typeof item.details.imdb.rating != 'number')
    return -1;
  return item.details.imdb.rating;
} 

$scope.filterFns = [
    {l: "Rotten Tomatoes rating", fn: sortByRtRating}, 
    {l: "IMDB rating", fn: sortByImdbRating}
];
$scope.filterFn = sortByRtRating;

function initialize() {
  var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
  var mapOptions = {
    zoom: 14,
    center: myLatlng
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  $scope.map = map;
  //$scope.map.setCenter(new google.maps.LatLng(54.57951, -4.41387));

  google.maps.event.addListener(map, 'dragend', function() {
    $scope.dontResize = true;

    var self = this;
    console.log(this);
    for (var i = 0; i < timeouts.map.length; i++) {
      $timeout.cancel(timeouts.map[i]);
    };

    var timeout = $timeout(function() {
      $scope.showSearchResults(self.center.k, self.center.D);
    }, 560);

    timeouts.map.push(timeout);    
  });
}

initialize();

    $scope.mapEvents = {
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

      $scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
    };
    setMap();

    $scope.cinemaMarkers = [];    


    /* interactions */
    var filterMovieList = function(venue_id) {
      var postcode = tempData.getData('postcode');
      var cinemaList = localStorageService.get('cinemaList'+postcode);

      console.log(cinemaList);

      $scope.filterOptions = {
        filtered: true,
        cinema: _.find(cinemaList, { venue_id: venue_id }).title
      }

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
      $scope.$apply();
    };   

    $scope.openTrailer = function(youtubeId) {
      $scope.youtubeId = youtubeId;
    };

    $scope.closeTrailer = function() {
      $scope.youtubeId = null;
    };

    $scope.reset = function() {
      $scope.movieList = $scope.storedMovieList;
      $scope.filtered = false;

      if ($scope.cinemaMarkers.length) {
        while($scope.cinemaMarkers.length) { 
          $scope.cinemaMarkers.pop().setMap(null);
        }
        $scope.cinemaMarkers = [];
        console.log($scope.cinemaMarkers);              
      }

      for (var id in $scope.movieList) {
        $scope.movieList[id].cinema = null;
        $scope.movieList[id].times = null;
      }

      var postcode = tempData.getData('postcode');
      var cinemaList = localStorageService.get('cinemaList'+postcode);
      createCinemaMarkers(cinemaList);

      $scope.filterOptions = {};
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
      while($scope.cinemaMarkers.length) { 
        $scope.cinemaMarkers.pop().setMap(null);
      }
      $scope.cinemaMarkers = [];
      console.log($scope.cinemaMarkers);

      var createInfoListener = function(marker, infoWindowText) {
        var infowindow = new google.maps.InfoWindow({
            content: infoWindowText,
            maxWidth: 120
        });
        
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open($scope.map,marker);
        });

        infowindow.open($scope.map,marker);
      };

      var createFilterListener = function(marker) {
        google.maps.event.addListener(marker, 'click', function() {
          console.log('setting',marker,marker.id);
          filterMovieList(marker.id);
          $scope.filtered = true;            
        });
      };

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

        var latlng = new google.maps.LatLng(cinemas[i].coords.lat,cinemas[i].coords.lng);
        var marker = new google.maps.Marker({
            position: latlng,
            map: $scope.map,
            title: cinemas[i].title,
            id: cinemas[i].venue_id,
            icon: 'images/cinema_icons/cinema.png'
        });        

        if (cinemas[i].movieTitle) {        
          var infoWindowText = '<b>'+cinemas[i].movieTitle+' at '+cinemas[i].title+'</b><p>'+cinemas[i].movieTimes+'</p>';

          createInfoListener(marker, infoWindowText);        
        } else {
          createFilterListener(marker);          
        }

        $scope.cinemaMarkers.push(marker);
      }
      var bounds = new google.maps.LatLngBounds();
      for(i=0;i<$scope.cinemaMarkers.length;i++) {
        console.log('POS',$scope.cinemaMarkers[i].getPosition());
        var pos = $scope.cinemaMarkers[i].getPosition();
        if (!isNaN(pos.k)) {
          bounds.extend($scope.cinemaMarkers[i].getPosition());
        }
      }
      if ($scope.resizeAfterSearch) {
        $scope.map.fitBounds(bounds);
        $scope.resizeAfterSearch = false;
      }
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
      $scope.resizeAfterSearch = true;
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
        $scope.storedMovieList = $scope.movieList;
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
          $scope.storedMovieList = $scope.movieList;
        });
      }, function() {
        console.log('We got an error with the postcode');
      });
    };	  

    var getLocationByIp = function() {
      geolocation.get().then(function(coords) {
      // geolocation.get().then(function(coords) {
        $scope.resizeAfterSearch = true;
        $scope.showSearchResults(51.5000,-0.1167)
      });
    } 

    if ($routeParams.location) {
      $scope.address = $routeParams.location;
      $scope.doSearch();
    } else {
      getLocationByIp();
    }

  });
