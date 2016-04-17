var fs = require('fs');
var path = require('path');

var helper = require('./helper');

var assert = helper.assert;

describe('remove-option', function() {
  var fixture, repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('remove-option', function(error, dir) {
      if (error) {
        return done(error);
      }
      fixture = dir;
      repo = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/src');
      done();
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });

  it('removes all specified files', function(done) {
    var fn = 'to-remove/file.txt';
    fs.exists(path.join(repo, fn), function(exists) {
      if (!exists) {
        done();
      } else {
        done(new Error(fn + ' was not removed'));
      }
    });
  });

  it('removes nested files', function(done) {
    var fn = 'to-remove/nested/other.txt';
    fs.exists(path.join(repo, fn), function(exists) {
      if (!exists) {
        done();
      } else {
        done(new Error(fn + ' was not removed'));
      }
    });
  });

  it('removes deeply nested files', function(done) {
    var fn = 'to-remove/nested/deep/file.txt';
    fs.exists(path.join(repo, fn), function(exists) {
      if (!exists) {
        done();
      } else {
        done(new Error(fn + ' was not removed'));
      }
    });
  });

  it('preserves non-removed files', function(done) {
    var fn = 'preserve.txt';
    fs.exists(path.join(repo, fn), function(exists) {
      if (!exists) {
        done(new Error(fn + ' was unexpectedly removed'));
      } else {
        done();
      }
    });
  });

});
