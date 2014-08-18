'use strict';

describe('Filter: trimWords', function () {

  // load the filter's module
  beforeEach(module('cinemaApp'));

  // initialize a new instance of the filter before each test
  var trimWords;
  beforeEach(inject(function ($filter) {
    trimWords = $filter('trimWords');
  }));

  it('should return the input prefixed with "trimWords filter:"', function () {
    var text = 'angularjs';
    expect(trimWords(text)).toBe('trimWords filter: ' + text);
  });

});
