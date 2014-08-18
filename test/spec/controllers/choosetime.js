'use strict';

describe('Controller: ChoosetimeCtrl', function () {

  // load the controller's module
  beforeEach(module('cinemaApp'));

  var ChoosetimeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChoosetimeCtrl = $controller('ChoosetimeCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
