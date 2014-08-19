'use strict';

/**
 * @ngdoc directive
 * @name cinemaApp.directive:youtubePlayer
 * @description
 * # youtubePlayer
 */
angular.module('cinemaApp')
  .directive('youtubePlayer', function ($sce) {
    return {
		templateUrl: '/views/youtubeplayer.html',
		replace: true,
		restrict: 'E',
		link: function postLink(scope) {
			scope.$watch('yId', function(newVal) {
				if (newVal) {
					scope.url = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+newVal+'?autoplay=1&showinfo=0&controls=0&iv_load_policy=3&enablejsapi=1');
				}
			}, true);
			scope.$on('play', function() {
				console.log('will play');
				document.getElementById('ytplayer').playVideo();
			});
			scope.$on('pause', function() {
				console.log('will pause');
				document.getElementById('ytplayer').pauseVideo();
			});
		}
    };
  });
