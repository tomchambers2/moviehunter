'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.Getdetails
 * @description
 * # Getdetails
 * Service in the cinemaApp.
 */
angular.module('cinemaApp')
  .service('Proxy', function Getdetails($http) {
  	this.get = function(url) {
	    var promise = $http.get('http://localhost:8080?url='+url).then(function (response) {
	    	return response.data;
	    });
	    return promise;
	};
  });
