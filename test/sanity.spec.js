var fs = require('fs');

var chai = require('chai');

var helper = require('./helper');


/** @type {boolean} */
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe('sanity', function() {
  var scratch;
  before(function(done) {
    helper.beforeFixture('sanity', function(error, dir) {
      scratch = dir;
      done(error);
    });
  });

  after(function(done) {
    helper.afterFixture(scratch, done);
  });

  it('exists', function(done) {
    fs.stat(scratch, function(error, stats) {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });
});
