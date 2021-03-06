'use strict';

describe('Directive: expand', function () {

  // load the directive's module
  beforeEach(module('cinemaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<expand></expand>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the expand directive');
  }));
});
