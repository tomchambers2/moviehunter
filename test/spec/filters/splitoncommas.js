'use strict';

describe('Filter: splitOnCommas', function () {

  // load the filter's module
  beforeEach(module('cinemaApp'));

  // initialize a new instance of the filter before each test
  var splitOnCommas;
  beforeEach(inject(function ($filter) {
    splitOnCommas = $filter('splitOnCommas');
  }));

  it('should return the input prefixed with "splitOnCommas filter:"', function () {
    var text = 'angularjs';
    expect(splitOnCommas(text)).toBe('splitOnCommas filter: ' + text);
  });

});
