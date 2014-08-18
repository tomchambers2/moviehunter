'use strict';

describe('Service: Directions', function () {

  // load the service's module
  beforeEach(module('cinemaApp'));

  // instantiate service
  var Directions;
  beforeEach(inject(function (_Directions_) {
    Directions = _Directions_;
  }));

  it('should do something', function () {
    expect(!!Directions).toBe(true);
  });

});
