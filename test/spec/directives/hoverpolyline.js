'use strict';

describe('Directive: hoverPolyline', function () {

  // load the directive's module
  beforeEach(module('cinemaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hover-polyline></hover-polyline>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the hoverPolyline directive');
  }));
});
