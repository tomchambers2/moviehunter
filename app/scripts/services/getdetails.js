'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.Getdetails
 * @description
 * # Getdetails
 * Service in the cinemaApp.
 */
angular.module('cinemaApp')
  .service('Getdetails', function Getdetails($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var promise = $http.get('http://www.google.com').then(function (response) {
    	console.log(response);
    	return response.data;
    });
    return promise;
  });
