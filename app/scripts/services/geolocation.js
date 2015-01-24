'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.geolocation
 * @description
 * # geolocation
 * Factory in the cinemaApp.
 */
angular.module('cinemaApp')
  .factory('geolocation', function ($q, $http) {
   function get() {
    var deferred = $q.defer();

     $http.get('http://www.telize.com/geoip').
       then(function(result) {
          var coords = {
            latitude: result.data.latitude,
            longitude: result.data.longitude
          };
          deferred.resolve(coords);
     });

    return deferred.promise;
   }

    return {
      get: get
    };
  });
