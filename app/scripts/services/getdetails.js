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
  		var base = 'http://warm-cliffs-7633.herokuapp.com/?url='
	    var promise = $http.get(base+url).then(function (response) {
	    	return response.data;
	    });
	    return promise;
	};
  });
