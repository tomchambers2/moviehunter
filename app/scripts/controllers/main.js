'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:MainNewCtrl
 * @description
 * # MainNewCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
.controller('MainCtrl', function ($scope, $location, $routeParams, $q, $timeout, Geocoder, geolocation) {
  var ref = new Firebase('https://movielistings.firebaseio.com/');
  var cinemasRef = ref.child('cinemas');
  var moviesRef = ref.child('movies');
  var geoFire = new GeoFire(ref.child('cinemasGeofire'));  

  $scope.loading = true;

  var defaultRadius = 2.813 //in km. change this if the default zoom changes to load all cinemas

  var geoQuery = geoFire.query({
    center: [51.5000,-0.1167],
    radius: defaultRadius
  });

  $scope.filters = {
    moviename: ''
  };

  $scope.movieNames = [];

  $scope.cinemasLoading = true;

  $scope.selectedMovie = null;
  $scope.selectedCinema = null;
  $scope.selectedDay = moment().startOf('day').valueOf();
  $scope.selectedDays = {
    0: moment().startOf('day').valueOf(),
    1: moment().startOf('day').add(1, 'days').valueOf(),
    2: moment().startOf('day').add(2, 'days').valueOf(),
    3: moment().startOf('day').add(3, 'days').valueOf(),
  };

  $scope.selectedDayIndex = 0;

  $scope.tomorrowPlus1 = moment().startOf('day').add(2, 'days').format('dddd');
  $scope.tomorrowPlus2 = moment().startOf('day').add(3, 'days').format('dddd');

  $scope.movieIds = [];
  $scope.movies = [];
  $scope.cinemas = [];

  $scope.cinemaMovies = {};

  // $scope.searchMoviesFast = function() {
  //   return _.some($scope.movies, $scope.filters.moviename);
  // }

  $scope.setMovienameFilter = function() {
    $scope.unselectCinema();
    $scope.filters.moviename = $scope.searchMoviename;
  }
  $scope.resetMovienameFilter = function() {
    $scope.searchMoviename = '';
    $scope.filters.moviename = '';
  }

  $scope.resetFilters = function() {
    $scope.searchMoviename = '';
    $scope.selectedCinema = null;
    $scope.selectedMovie = null;
    $scope.filters.moviename = '';
  };

  $scope.$on('selectedCinema', function(event, tid) {
    $scope.selectCinema({ tid: tid, dontReset: true });
  });

  $scope.filterByMovieIds = function(item) {
    //PERFORMANCE: this runs on every digest. is it performant?
    if ($scope.movieIds.indexOf(item.id)>-1) return true;
  };

  $scope.filterBySelectedCinema = function(item) {
    //PERFORMANCE: this runs on every digest. is it performant?
    if (!$scope.selectedCinema) return true;
    if (item[$scope.selectedCinema]) return true;
  };

  $scope.selectDay = function(adjust) {
    $scope.selectedDay = moment().add(adjust, 'days').startOf('day').valueOf();
    $scope.selectedDayIndex = parseInt(adjust, 10);
    //FIX: should get the formatted string of the day, not the moment object
  };

  geoQuery.on('key_entered', function(key) {
    cinemasRef.child(key).on('value', function(result) {
      $scope.cinemasLoading = false;
      var cinema = result.val();
      if (cinema===null) return;
      if (_.findWhere($scope.cinemas, { tid: cinema.tid })) return;
      $scope.cinemas.push(cinema);
      if (cinema.movies) {
        for (var i = 0; i < cinema.movies.length; i++) {
          $scope.movieIds.push(cinema.movies[i]);
        }
      }
      $scope.$apply();
    });    
  });

  geoQuery.on('key_exited', function(key) {
    cinemasRef.child(key).on('value', function(result) {
      var cinema = result.val();
      var matchingCinema = _.findWhere($scope.cinemas, { tid: cinema.tid });
      $scope.cinemas.splice($scope.cinemas.indexOf(matchingCinema), 1);
      if (cinema===null) return;
      if (cinema.movies) {
        for (var i = 0; i < cinema.movies.length; i++) {
          if (cinema.movies[i]===$scope.selectedMovie) continue;
          $scope.movieIds.splice($scope.movieIds.indexOf(cinema.movies[i]), 1);
        }     
      }
    });
  }); 
  
  moviesRef.on('child_added', function(result) {
    var movie = result.val();
    movie.id = result.key(); //TODO: add firebase key when pushing once, instead of every time on client side
    $scope.movies.push(movie);
    $scope.movieNames.push(movie.title);
    $scope.$apply(); //maybe swap for timeout or some way of batching calls, 61 is too many and too slow!
    //problem is that if I use timeout then it finishes after the cinema loads and causes error. this is a race condition and not good anyway...
  });


  /* filters */
  var sortByRtRating = function(item) {
    if (!item.rt) return -1;
    if (typeof item.rt.rating !== 'number') {      
      return -1;
    }
    return item.rt.rating;
  };  
  var sortByImdbRating = function(item) {
    if (!item.imdb) return -1;
    var ratingNumber = parseFloat(item.imdb.rating);
    if (typeof ratingNumber !== 'number') {      
      return -1;
    }
    return ratingNumber;
  }; 
  var sortByNewestFirst = function(item) {
    if (!item.rt.releaseDate) return -1;
    return item.rt.releaseDateTimestamp;
  };
  var sortByOldestFirst = function(item) {
    if (!item.rt.releaseDate) return -1;
    return -item.rt.releaseDateTimestamp;
  };  
  $scope.filterFns = [
      {l: 'Rotten Tomatoes rating', fn: sortByRtRating}, 
      {l: 'IMDB rating', fn: sortByImdbRating},
      {l: 'Newest movies first', fn:sortByNewestFirst},
      {l: 'Oldest movies first', fn:sortByOldestFirst}
  ];
  $scope.filterFn = sortByRtRating;

  $scope.selectCinema = function(params) {
    if (!params.dontReset) {
      $scope.resetFilters();
    }

    var cinema;
    if (!params.cinema) {
      cinema = _.findWhere($scope.cinemas, { tid: params.tid });
      updateUrl({cinema: cinema});
    }

    $timeout(function() {
      $scope.selectedCinema = params.tid;      
      $scope.selectedCinemaObject = params.cinema || cinema;
    });
  };

  $scope.unselectCinema = function() {
    unselectCinema();
  }

  var unselectCinema = function() {
    $timeout(function() {
      updateUrl();
      $scope.selectedCinema = null;
    })
  };  

  $scope.filterCinemas = function(params) {
    var movie = _.findWhere($scope.movies, { id: params.movie });
    if (params.reset) {
      $scope.resetFilters();
    }
    if (params.updateUrl) {
      updateUrl({ movie: movie });
    }

    
    $timeout(function() {
      //$scope.selectedMovie = movie.id;
      //$scope.selectedMovieObject = movie;
      $scope.filters.moviename = $scope.searchMoviename = movie.title;
      if (params.cinema) {
        $scope.selectCinema({ cinema: params.cinema, dontReset: true });
      } 
    });
  };

  $scope.unfilterCinemas = function() {
    var path = $location.path();
    var locationParameter = path.match(/^(\/[a-z0-9.+-]+)/);
    $timeout(function() {
      //TODO: maybe this should be a formatted address rather than lat long? although this is more accurate
      $location.path(locationParameter[1], false);
    });      
    $scope.selectedMovie = null;
    $scope.filters.moviename = '';
    $scope.selectedMovieObject = null;
  };  

  /* map stuff */
  function initialize() {
    var myLatlng = new google.maps.LatLng(51.5000,-0.1167);
    var mapOptions = {
      zoom: 14,
      minZoom: 14,
      center: myLatlng
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    $scope.map = map;

    var mcOptions = {
      maxZoom: 16,
      imageExtension: 'png',
      imagePath: '/images/cinema_icons/cinema-stack'
      //zoomOnClick: false
    };
    var mc = new MarkerClusterer(map, [], mcOptions);
    $scope.mc = mc;

    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = this.getBounds();

      var center = bounds.getCenter();
      var ne = bounds.getNorthEast();

      // r = radius of the earth in statute miles
      var r = 3963.0;  

      // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
      var lat1 = center.lat() / 57.2958; 
      var lon1 = center.lng() / 57.2958;
      var lat2 = ne.lat() / 57.2958;
      var lon2 = ne.lng() / 57.2958;

      // distance = circle radius from center to Northeast corner of bounds
      var distance = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));      

      var distanceKM = distance * 1.609344;

      geoQuery.updateCriteria({
        radius: distanceKM
      });
    });    

    google.maps.event.addListener(map, 'dragend', function() {
      unselectCinema();
      $scope.updateGeoQuery(this.center.k, this.center.D);
      updateUrl({ coords: { lat: this.center.k, lng: this.center.D } });
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
      $scope.updateGeoQuery(this.center.k, this.center.D);
      updateUrl({ coords: { lat: this.center.k, lng: this.center.D } });
    });   
  }

  $scope.showSearchResults = function(lat, lng) {
    $scope.updateGeoQuery(lat, lng);

    setMap(lat, lng);

    $scope.loading = false;
  };

  $scope.updateGeoQuery = function(lat, lng) {
    geoQuery.updateCriteria({
      center: [parseFloat(lat), parseFloat(lng)]
    }); 
  };

  var updateUrl = function(params) {
    if (params && params.movie && params.cinema) {
      //is this ever a user created thing?
      return;
    } else if (params && params.movie) {
      $timeout(function() {
        var location = $scope.map.center.k + '+' + $scope.map.center.D;
        $location.path(location+'/'+params.movie.url, false);
      });
      return;
    } else if (params && params.cinema) {
      $timeout(function() {
        //TODO: maybe this should be a formatted address rather than lat long? although this is more accurate
        $location.path('/cinema/'+params.cinema.url, false);
      });
      return;
    }
    $timeout(function() {
      //TODO: maybe this should be a formatted address rather than lat long? although this is more accurate        
      var location = $scope.map.center.k + '+' + $scope.map.center.D;
      if ($scope.selectedMovie) {
        var movie = _.findWhere($scope.movies, { id: $scope.selectedMovie });
        $location.path('/'+location+'/'+movie.url, false);
      } else {
        $location.path('/'+location, false);
      }
    });
  }

  function addYouAreHereMarker(coords) {
    if ($scope.youAreHereMarker) {
      $scope.youAreHereMarker.setMap(null); //remove old marker
    }
    $scope.youAreHereMarker = new google.maps.Marker({
        position: {
          lat: coords.lat,
          lng: coords.lng
        },
        map: $scope.map,
        title: coords.formattedAddress,
        id: 'youAreHere'
    });    
  }

  /* search functions */
  $scope.doSearch = function(address) {
    $scope.geolocationFailed = false;
    $scope.addressError = false;
    address = address ? address : $scope.address;
    $scope.loading = true;
    Geocoder.latLngForAddress(address).then(function(coords) {
        addYouAreHereMarker(coords);

        $scope.updateGeoQuery(coords.lat,coords.lng);
        setMap(coords.lat,coords.lng);
        $scope.loading = false;
    }, function(err) {
        $scope.addressError = true;
        $scope.loading = false;
        throw new Error('Problem geocoding users address',err);
        
    });
  };  

  initialize();
  var setMap = function(latitude, longitude) {
    latitude = latitude ? latitude : 51.5000;
    longitude = longitude ? longitude : -0.1167;

    $scope.map.setCenter(new google.maps.LatLng(latitude, longitude));

    if (!$location.path) {
      updateUrl({coords: { lat: latitude, lng: longitude } });
    }
  };
  setMap();        

  /* trailer */
  $scope.playerVars = {
    autoplay: 1,
    showinfo: 0,
    controls: 1,
    iv_load_policy: 3,
    rel: 0,
    modestbranding: 1
  };    
  $scope.youtubePlayer = {
    player: null
  };  
  $scope.openTrailer = function(movie) {
    $scope.youtubeId = movie.youtube;
  };
  $scope.closeTrailer = function() {
    $scope.youtubeId = null;
  }; 

  /* geolocation */
  if (navigator.geolocation) {
    $scope.geolocationFeature = true;
  }
  $scope.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
      $scope.loading=true;
      $scope.address='Finding you...';
    } else {
      console.warn('Geolocation is not available in this browser, please type your postcode manually');
    }
  };
  var showPosition = function(pos) {
    $scope.showSearchResults(pos.coords.latitude, pos.coords.longitude);
  };
  var showError = function() {
    console.warn('Geolocation failed or permission was denied');
  };  

  var getLocationByIp = function() {
    geolocation.get().then(function(coords) {
      if (coords==='not in the uk') {
        $timeout(function() {
          $scope.geolocationFailed = true;
        });
        return;
      }

      $scope.showSearchResults(coords.latitude,coords.longitude);
    });
  };

  //LOCATION AND MOVIE
  var coords;
  if ($routeParams.location && $routeParams.movie) {
    console.info('LOCATION AND MOVIE');
    moviesRef.orderByChild('url').equalTo($routeParams.movie).on('child_added', function(result) {
      var movie = result.val();
      movie.id = result.key();
      $scope.filterCinemas({ movie: movie.id, updateUrl: false });
      $timeout(function() {
        $scope.filters.moviename = movie.title;
      });
    });
    coords = $routeParams.location.match(/([0-9]{2}[0-9.]+)\+([-0-9.]+)/);
    if (coords) {
      $scope.showSearchResults(coords[1], coords[2]);
    } else {
      $scope.doSearch($routeParams.location);
    }
  //CINEMA AND MOVIE
  } else if ($routeParams.cinema && $routeParams.movie) {
    console.info('CINEMA AND MOVIE',$routeParams.cinema, $routeParams.movie);
    moviesRef.orderByChild('url').equalTo($routeParams.movie).on('child_added', function(result) {
      var movie = result.val();
      movie.id = result.key();
      $scope.filterCinemas({ movie: movie.id, updateUrl: false });
      $timeout(function() {      
        $scope.filters.moviename = movie.title;
      });
    });
    cinemasRef.orderByChild('url').equalTo($routeParams.cinema).on('child_added', function(result) {
      var cinema = result.val();
      $scope.cinemas.push(cinema);
      $scope.showSearchResults(cinema.coords[0],cinema.coords[1]);
      $scope.selectCinema({ tid: cinema.tid, cinema: cinema, dontReset: true });
    });
  //LOCATION ONLY
  } else if ($routeParams.location) {
    coords = $routeParams.location.match(/([0-9]{2}[0-9.]+)\+([-0-9.]+)/);
    if (coords) {
      $scope.showSearchResults(coords[1], coords[2]);
    } else {
      $scope.doSearch($routeParams.location);
    }    
  //MOVIE ONLY
  } else if ($routeParams.movie) {
    console.info('MOVIE ONLY');
    getLocationByIp();
    moviesRef.orderByChild('url').equalTo($routeParams.movie).on('child_added', function(result) {
      console.info('got movie',result.val());
      var movie = result.val();
      movie.id = result.key();
      $scope.filterCinemas({ movie: movie.id, updateUrl: true });
      $timeout(function() {      
        $scope.filters.moviename = movie.title;
      });
    });
  //CINEMA ONLY
  } else if ($routeParams.cinema) {
    cinemasRef.orderByChild('url').equalTo($routeParams.cinema).on('child_added', function(result) {
      var cinema = result.val();
      $scope.cinemas.push(cinema);
      $scope.selectCinema({ tid: cinema.tid, cinema: cinema });
      $scope.showSearchResults(cinema.coords[0],cinema.coords[1]);
    });
  } else {
    getLocationByIp();
  }

});
