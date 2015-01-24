'use strict';

describe('Filter: selectedTags', function () {

  // load the filter's module
  beforeEach(module('cinemaApp'));

  // initialize a new instance of the filter before each test
  var selectedTags;
  beforeEach(inject(function ($filter) {
    selectedTags = $filter('selectedTags');
  }));

  it('should return the input prefixed with "selectedTags filter:"', function () {
    var text = 'angularjs';
    expect(selectedTags(text)).toBe('selectedTags filter: ' + text);
  });

});
