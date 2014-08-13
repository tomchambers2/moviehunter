'use strict';

/**
 * @ngdoc function
 * @name cinemaApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the cinemaApp
 */
angular.module('cinemaApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
