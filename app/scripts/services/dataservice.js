'use strict';

/**
 * @ngdoc service
 * @name cinemaApp.dataService
 * @description
 * # dataService
 * Factory in the cinemaApp.
 */
angular.module('cinemaApp')
  .factory('tempData', function () {
    var data = {};

    return {
      saveData: function(index, content) {
        data[index] = content;
      },
      getData: function(index) {
        return data[index];
      }
    };
  })
  .factory('choices', function(localStorageService) {
    var choices = {};
    //could add some checking into this so only preset keys can be saved to avoid mistakes

    return {
      saveChoice: function(index, data) {
        choices[index] = data;
        localStorageService.add(index,data);
      },
      getData: function(index) {
        if (localStorageService.get(index)) {
          return localStorageService.get(index);
        } else {
          return choices[index];
        }
      }
    }
  })
