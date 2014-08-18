'use strict';

describe('Controller: PickcinemaCtrl', function () {

  // load the controller's module
  beforeEach(module('cinemaApp'));

  var PickcinemaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PickcinemaCtrl = $controller('PickcinemaCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
