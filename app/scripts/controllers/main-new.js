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
  };

  $scope.filters = {
    moviename: ''
  };

  $scope.selectedMovie = null;
  $scope.selectedCinema = null;

  $scope.movieIds = [];
  $scope.movies = [];
  $scope.cinemas = [];

  $scope.cinemaMovies = {};

  $scope.filterByMovieIds = function(item) {
    //PERFORMANCE: this runs on every digest. is it performant?
    if ($scope.movieIds.indexOf(item.id)>-1) return true;
  };

  var ref = new Firebase("https://movielistings.firebaseio.com/");
  var cinemasRef = ref.child('cinemas');
  var moviesRef = ref.child('movies');
  var geoFire = new GeoFire(ref.child('cinemasGeofire'));  

  var geoQuery = geoFire.query({
    center: [51.5000,-0.1167],
    radius: 2
  });

  geoQuery.on('key_entered', function(key, location, distance) {
    cinemasRef.child(key).on('value', function(result) {
      var cinema = result.val();
      $scope.cinemas.push(cinema);
      if (cinema===null) return;
      if (cinema.movies) {
        for (var i = 0; i < cinema.movies.length; i++) {
          $scope.movieIds.push(cinema.movies[i]);
        };
      }
      $scope.$apply();
    });    
  });

  geoQuery.on('key_exited', function(key, location, distance) {
    cinemasRef.child(key).on('value', function(result) {
      var cinema = result.val();
      $scope.cinemas.splice($scope.cinemas.indexOf(cinema), 1);
      if (cinema===null) return;
      if (cinema.movies) {
        for (var i = 0; i < cinema.movies.length; i++) {
          $scope.movieIds.splice($scope.movieIds.indexOf(cinema.movies[i]), 1);
        };      
      }
    });
  }); 

  moviesRef.on('child_added', function(result) {
    var movie = result.val();
    movie.id = result.key(); //TODO: add firebase key when pushing once, instead of every time on client side
    $scope.movies.push(movie);
    $scope.$apply(); //maybe swap for timeout or some way of batching calls, 61 is too many and too slow!
  });


  // /* filters */
  // var sortByRtRating = function(item) {
  //   if (!item.details) return -1;
  //   if (typeof item.details.rt.rating != 'number')
  //     return -1;
  //   return item.details.rt.rating;
  // }  
  // var sortByImdbRating = function(item) {
  //   if (!item.details) return -1;
  //   if (typeof item.details.imdb.rating != 'number')
  //     return -1;
  //   return item.details.imdb.rating;
  // } 
  // $scope.filterFns = [
  //     {l: "Rotten Tomatoes rating", fn: sortByRtRating}, 
  //     {l: "IMDB rating", fn: sortByImdbRating}
  // ];
  // $scope.filterFn = sortByRtRating;

  $scope.filterCinemas = function(movieId) {
    $scope.selectedMovie = movieId;
  };

  $scope.unfilterCinemas = function(movieId) {
    $scope.selectedMovie = null;
  };  

  /* map stuff */
  function initialize() {
    var myLatlng = new google.maps.LatLng(51.5000,-0.1167);
    var mapOptions = {
      zoom: 12,
      center: myLatlng
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    $scope.map = map;

    google.maps.event.addListener(map, 'dragend', function() {
      $scope.updateGeoQuery(this.center.k, this.center.D);
    });
  }

  $scope.updateGeoQuery = function(lat, lng) {
    geoQuery.updateCriteria({
      center: [lat, lng]
      //radius: 2 TODO: add getting the radius from zoom level of map
    }); 
  }

  initialize();
  var setMap = function(latitude, longitude) {
    latitude = latitude ? latitude : 51.5000;
    longitude = longitude ? longitude : -0.1167;

    $scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
  };
  setMap();   
  $scope.events = {
    click: function(marker, eventName, model) {
      filterMovieList(model.id);
      $scope.filtered = true;
    }
  };        

  // /* trailer controls */
  // $scope.playerVars = {
  //   autoplay: 1,
  //   showinfo: 0,
  //   controls: 1,
  //   iv_load_policy: 3,
  //   rel: 0,
  //   modestbranding: 1
  // };    
  // $scope.youtubePlayer = {
  //   player: null
  // };  
  // $scope.openTrailer = function(youtubeId) {
  //   $scope.youtubeId = youtubeId;
  // };
  // $scope.closeTrailer = function() {
  //   $scope.youtubeId = null;
  // }; 

  // /* geolocation */
  // if (navigator.geolocation) {
  //   $scope.geolocationFeature = true;
  // }
  // $scope.getLocation = function() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(showPosition, showError);
  //     $scope.searching=1;
  //     $scope.address='Finding your address automatically...';
  //   } else {
  //     console.log('Geolocation is not available in this browser, please type your postcode manually');
  //   }
  // };
  // var showPosition = function(pos) {
  //   $scope.searching=1;
  //   var latitude = pos.coords.latitude;
  //   var longitude = pos.coords.longitude;
  //   $scope.usedGeolocation = true;
  //   $scope.showSearchResults(latitude, longitude);
  // };
  // var showError = function() {
  //   console.log('Geolocation failed or permission was denied');
  // };  

  // /* search functions */
  // $scope.doSearch = function() {
  //   $scope.resizeAfterSearch = true;
  //   $scope.searching = 1;
  //   Geocoder.latLngForAddress($scope.address).then(function(coords) {
  //       $scope.showSearchResults(coords.lat,coords.lng);
  //       setMap(coords.lat,coords.lng);
  //   }, function(err) {
  //       $scope.loading=0;
  //   });
  // };

  // var stopSearching = function() {
  //   $scope.loading=0;
  // };

  // $scope.showSearchResults = function(lat, lng) {
  //   geoQuery.updateCriteria({
  //     center: [lat, lng],
  //     radius: 2
  //   }); 
  // }

  // var createCinemaMarker = function(tid) {
  //     cinemas.child(tid).on('value', function(result) {
  //       var cinema = result.val();
  //       var latlng = new google.maps.LatLng(cinema.coords[0],cinema.coords[1]);
  //       var marker = new google.maps.Marker({
  //           position: latlng,
  //           map: $scope.map,
  //           title: cinema.title,
  //           id: cinemas.tid,
  //           icon: 'images/cinema_icons/cinema.png'
  //       });
  //       $scope.markers[tid] = marker;

  //       $scope.cinemaMovies[tid] = [];

  //       if (cinema.movies) {
  //         for (var i = 0; i < cinema.movies.length; i++) {
  //           moviesRef.child(cinema.movies[i]).on('value', function(movie) {
  //             $scope.cinemaMovies[tid].push(movie.title);
  //           });
  //         };
  //       }

  //       var content = '<p><strong>'+cinema.title+'</strong></p><p>'+$scope.cinemaMovies[tid]+'</p>';

  //       var infowindow = new google.maps.InfoWindow({
  //           content: content,
  //           maxWidth: 120
  //       });
        
  //       google.maps.event.addListener(marker, 'click', function() {
  //         infowindow.open($scope.map,marker);
  //       }); 

  //       // google.maps.event.addListener(marker, 'mouseout', function() {
  //       //   infowindow.close($scope.map,marker);
  //       // }); 
  //     });

  // };

  // var removeCinemaMarker = function(tid) {
  //   $scope.markers[tid].setMap(null);
  //   $scope.markers[tid] = null;
  // };

  // var populateMovies = function(tid) {
  //     cinemas.child(tid).on('value', function(result) {
  //       console.log("RESULT",result.val());
  //       var movieIds = result.val().movies;
  //       if (!movieIds) return;
  //       console.log("will add",movieIds);
  //       $scope.movieIds.concat(movieIds);
  //     });
  // };

  // var renderMovies = function() {
  //     var movieIds = _.uniq($scope.movieIds);
  //     for (var i = 0; i < movieIds.length; i++) {
  //       moviesRef.child(movieIds[i]).once('value', function(result) {
  //         var movie = result.val();
  //       });
  //       $scope.$apply();
  //     };  
  // };
  // */

  // var getLocationByIp = function() {
  //   geolocation.get().then(function(coords) {
  //     $scope.resizeAfterSearch = true;
  //     $scope.showSearchResults(51.5000,-0.1167);
  //   });
  // } 

  // //if movie - set scope selectedMovie to that movie - also needs to filter cinemas playing it

  // if ($routeParams.location) {
  //   $scope.address = $routeParams.location;
  //   $scope.doSearch();
  // } else {
  //   getLocationByIp();
  // }

});
