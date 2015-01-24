'use strict';

/**
 * @ngdoc overview
 * @name cinemaApp
 * @description
 * # cinemaApp
 *
 * Main module of the application.
 */
angular
  .module('cinemaApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'uiGmapgoogle-maps',
    'ngAutocomplete',
    'geocoder',
    'ngFitText',
    'youtube-embed',
    'LocalStorageModule',
    'angularMoment',
    'angulartics',
    'angulartics.segment.io',
    'ui.bootstrap',
    'ngFitText'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main-new.html',
        controller: 'MainNewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
 .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix('ls');
 }])
  .config(['$provide', function($provide) {
    //https://gist.github.com/JGarrido/8100714 - should be updated if refactoring
    //http://stackoverflow.com/questions/25630994/make-q-all-fail-silently-when-one-promise-is-rejected/25637431
    $provide.decorator("$q", ["$delegate", function($delegate) {
      var $q = $delegate;
    
      $q.allComplete = function(promises) {

        if(!angular.isArray(promises)) {
          throw Error("$q.allComplete only accepts an array.");
        }

        var deferred = $q.defer();
        var passed = 0;
        var failed = 0;
        var responses = [];

        angular.forEach(promises, function (promise, index) {
          promise
            .then( function(result) {
              console.info('done', result);
              passed++;
              responses.push(result);
            })
            .catch( function(result) {
              console.error('err', result);
              failed++;
              responses.push(result);
            })
            .finally( function() {
              if((passed + failed) == promises.length) {
                console.log("COMPLETE: " + "passed = " + passed + ", failed = " + failed);

                /*
                if(failed > 0) {
                  deferred.reject(responses);
                } else {
                  deferred.resolve(responses);
                }
                */
                deferred.resolve(responses); //return regardless of failure
              }
            })
          ;
        });

        return deferred.promise;

      };

      return $q;
    }]);

  }]);