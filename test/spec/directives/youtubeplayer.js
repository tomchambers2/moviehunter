'use strict';

describe('Directive: youtubePlayer', function () {

  // load the directive's module
  beforeEach(module('cinemaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<youtube-player></youtube-player>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the youtubePlayer directive');
  }));
});
