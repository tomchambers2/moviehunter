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
 }]);
