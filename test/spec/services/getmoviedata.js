'use strict';

describe('Service: getMovieData', function () {

  // load the service's module
  beforeEach(module('cinemaApp'));

  // instantiate service
  var getMovieData;
  beforeEach(inject(function (_getMovieData_) {
    getMovieData = _getMovieData_;
  }));

  it('should do something', function () {
    expect(!!getMovieData).toBe(true);
  });

});
