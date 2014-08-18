'use strict';

describe('Service: collatedata', function () {

  // load the service's module
  beforeEach(module('cinemaApp'));

  // instantiate service
  var collatedata;
  beforeEach(inject(function (_collatedata_) {
    collatedata = _collatedata_;
  }));

  it('should do something', function () {
    expect(!!collatedata).toBe(true);
  });

});
