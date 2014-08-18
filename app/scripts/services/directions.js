'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.Directions
 * @description
 * # Directions
 * Service in the cinemaApp.
 */
angular.module('cinemaApp')
  .factory('Directions', function Directions($q) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    //return for each request of start and end points - the time, polyline. add to cinema stuff.
    var directions = new google.maps.DirectionsService();

    var doRequest = function(start,end,travelMode) {
    	var deferred = $q.defer();
    	var startLatLng = new google.maps.LatLng(start.lat,start.lng);
    	var endLatLng = new google.maps.LatLng(end.lat,end.lng);

	    var request = {
	    	origin: startLatLng,
	    	destination: endLatLng,
	    	travelMode: google.maps.TravelMode.DRIVING
	    };

	    directions.route(request, function(response, status) {
	    	console.log(response);
	    	deferred.resolve(response);
	    });   
	    return deferred.promise; 	
    }

    return {
		doRequest: doRequest
    }

  });
