'use strict';

window.prerenderReady = false;

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
    'ngRoute',
    'geocoder',
    'youtube-embed',
    'angulartics',
    'angulartics.segment.io',
    'angular-lodash',
  ])
  .constant('angularMomentConfig', {
      timezone: 'Europe/London' // optional
  }) 
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/cinema/:cinema/:movie', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      })      
      .when('/cinema/:cinema', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      })      
      .when('/movie/:movie', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      })        
      .when('/:location/:movie', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      })       
      .when('/:location', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(['$provide', function($provide) {
    //https://gist.github.com/JGarrido/8100714 - should be updated if refactoring
    //http://stackoverflow.com/questions/25630994/make-q-all-fail-silently-when-one-promise-is-rejected/25637431
    $provide.decorator('$q', ['$delegate', function($delegate) {
      var $q = $delegate;
    
      $q.allComplete = function(promises) {

        if(!angular.isArray(promises)) {
          throw Error('$q.allComplete only accepts an array.');
        }

        var deferred = $q.defer();
        var passed = 0;
        var failed = 0;
        var responses = [];

        angular.forEach(promises, function (promise) {
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
              if((passed + failed) === promises.length) {
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

  }]).
  run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
      var original = $location.path;
      $location.path = function (path, reload) {
          if (reload === false) {
              var lastRoute = $route.current;
              var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = lastRoute;
                  un();
              });
          }
          return original.apply($location, [path]);
      };
  }]);