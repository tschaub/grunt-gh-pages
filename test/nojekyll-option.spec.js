var fs = require('fs');
var path = require('path');

var helper = require('./helper');

var assert = helper.assert;

describe('nojekyll-option', function() {
  var fixture, repo1, repo2, repo3;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('nojekyll-option', function(error, dir) {
      if (error) {
        return done(error);
      }
      fixture = dir;
      repo1 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/first');
      repo2 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/second');
      repo3 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/third');
      done();
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });
  
  it('creates .grunt/grunt-gh-pages/gh-pages/first directory', function(done) {
    fs.stat(repo1, function(error, stats) {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
    });
  });

  it('creates a gh-pages branch', function(done) {
    var branch;
    helper.git(['rev-parse', '--abbrev-ref', 'HEAD'], repo1)
        .progress(function(chunk) {
          branch = String(chunk);
        })
        .then(function() {
          assert.strictEqual(branch, 'gh-pages\n', 'branch created');
          done();
        })
        .fail(done);
  });

  // Because the `src` pattern includes `sub/_underscore/sub.txt`
  it('creates .nojekyll file', function() {
    assert.strictEqual(fs.readFileSync(path.join(repo1, '.nojekyll'), 'utf8'),
                       '');
  });

  it('pushes the gh-pages branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo1)
        .then(function() {
          done();
        })
        .fail(done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/second directory', function(done) {
    fs.stat(repo2, function(error, stats) {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
    });
  });

  it('creates a gh-pages branch', function(done) {
    var branch;
    helper.git(['rev-parse', '--abbrev-ref', 'HEAD'], repo2)
        .progress(function(chunk) {
          branch = String(chunk);
        })
        .then(function() {
          assert.strictEqual(branch, 'gh-pages\n', 'branch created');
          done();
        })
        .fail(done);
  });

  // Because the `src` pattern doesn't include paths which start with '_'
  it('does not create .nojekyll file', function() {
    assert.isFalse(fs.existsSync(path.join(repo2, '.nojekyll')));
  });

  it('pushes the gh-pages branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo2)
        .then(function() {
          done();
        })
        .fail(done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/third directory', function(done) {
    fs.stat(repo3, function(error, stats) {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
    });
  });

  it('creates a gh-pages branch', function(done) {
    var branch;
    helper.git(['rev-parse', '--abbrev-ref', 'HEAD'], repo3)
        .progress(function(chunk) {
          branch = String(chunk);
        })
        .then(function() {
          assert.strictEqual(branch, 'gh-pages\n', 'branch created');
          done();
        })
        .fail(done);
  });

  // Because the `src` pattern doesn't include paths which start with '_'
  it('removes .nojekyll file', function() {
    assert.isFalse(fs.existsSync(path.join(repo3, '.nojekyll')));
  });

  it('pushes the gh-pages branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo3)
        .then(function() {
          done();
        })
        .fail(done);
  });

});
