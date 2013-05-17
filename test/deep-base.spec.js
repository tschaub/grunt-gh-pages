var fs = require('fs');
var path = require('path');

var chai = require('chai');

var helper = require('./helper');


/** @type {boolean} */
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe('deep-base', function() {
  var fixture, repo;

  before(function(done) {
    helper.buildFixture('deep-base', function(error, dir) {
      fixture = dir;
      repo = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/repo');
      done(error);
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/repo directory', function(done) {
    fs.stat(repo, function(error, stats) {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('creates a gh-pages branch', function(done) {
    var branch;
    helper.git(['rev-parse', '--abbrev-ref', 'HEAD'], repo)
        .progress(function(chunk) {
          branch = String(chunk);
        })
        .then(function() {
          assert.strictEqual(branch, 'gh-pages\n', 'branch created');
          done();
        })
        .fail(done);
  });

  it('copies source files relative to the base', function(done) {
    fs.exists(path.join(repo, 'hello.txt'), function(exists) {
      if (!exists) {
        done(new Error('Failed to find "hello.txt" in repo: ') + repo);
      } else {
        done();
      }
    });
  });

  it('pushes the gh-pages branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo)
        .then(function() {
          done();
        })
        .fail(done);
  });

});
