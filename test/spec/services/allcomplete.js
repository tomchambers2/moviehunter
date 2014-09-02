'use strict';

describe('Service: allComplete', function () {

  // load the service's module
  beforeEach(module('cinemaApp'));

  // instantiate service
  var allComplete;
  beforeEach(inject(function (_allComplete_) {
    allComplete = _allComplete_;
  }));

  it('should do something', function () {
    expect(!!allComplete).toBe(true);
  });

});
