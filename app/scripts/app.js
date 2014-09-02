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
    'google-maps',
    'ngAutocomplete',
    'geocoder',
    'ngFitText',
    'youtube-embed',
    'LocalStorageModule',
    'angularMoment'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/video', {
        templateUrl: 'views/video.html',
        controller: 'VideoCtrl'
      })
      .when('/choosedate', {
        templateUrl: 'views/choosedate.html',
        controller: 'ChoosedateCtrl'
      })
      .when('/pickcinema', {
        templateUrl: 'views/pickcinema.html',
        controller: 'PickcinemaCtrl'
      })
      .when('/choosetime', {
        templateUrl: 'views/choosetime.html',
        controller: 'ChoosetimeCtrl'
      })
      .when('/summary', {
        templateUrl: 'views/summary.html',
        controller: 'SummaryCtrl'
      })
      .when('/maptest', {
        templateUrl: 'views/maptest.html',
        controller: 'MaptestCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
 .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix('ls');
 }])
  .config( function($provide) {
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
  });
