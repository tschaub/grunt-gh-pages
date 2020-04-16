const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('dotfiles-option', () => {
  let fixture;
  let repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('dotfiles-option', (error, dir) => {
      if (error) {
        return done(error);
      }
      fixture = dir;
      repo = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/src');
      done();
    });
  });

  after(done => {
    helper.afterFixture(fixture, done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/src directory', done => {
    fs.stat(repo, (error, stats) => {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('creates a gh-pages branch', done => {
    helper
      .git(['rev-parse', '--abbrev-ref', 'HEAD'], repo)
      .then(branch => {
        assert.strictEqual(branch, 'gh-pages\n', 'branch created');
        done();
      })
      .catch(done);
  });

  it('pushes the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo)
      .then(() => {
        done();
      })
      .catch(done);
  });

  it('copies files with dots', done => {
    fs.exists(path.join(repo, '.one'), exists => {
      if (exists) {
        done();
      } else {
        done(new Error('Failed to find ".one" in repo: ') + repo);
      }
    });
  });

  it('copies files in directories with dots', done => {
    fs.exists(path.join(repo, 'foo', '.bar', 'two'), exists => {
      if (exists) {
        done();
      } else {
        done(new Error('Failed to find "foo/.bar/two" in repo: ') + repo);
      }
    });
  });
});
