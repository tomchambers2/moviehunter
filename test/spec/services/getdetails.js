'use strict';

describe('Service: Getdetails', function () {

  // load the service's module
  beforeEach(module('cinemaApp'));

  // instantiate service
  var Getdetails;
  beforeEach(inject(function (_Getdetails_) {
    Getdetails = _Getdetails_;
  }));

  it('should do something', function () {
    expect(!!Getdetails).toBe(true);
  });

});
