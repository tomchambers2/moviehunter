'use strict';

/**
 * @ngdoc filter
 * @name cinemaApp.filter:selectedTags
 * @function
 * @description
 * # selectedTags
 * Filter in the cinemaApp.
 */
angular.module('cinemaApp')
.filter('selectedGenres', function() {
    return function(tasks, genres) {
        return tasks.filter(function(task) {

            for (var i in task.Genres) {
                if (genres.indexOf(task.Genres[i]) > -1) {
                    return true;
                }
            }
            return false;

        });
    };
});
