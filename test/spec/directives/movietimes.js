'use strict';

describe('Directive: movieTimes', function () {

  // load the directive's module
  beforeEach(module('cinemaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<movie-times></movie-times>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the movieTimes directive');
  }));
});
