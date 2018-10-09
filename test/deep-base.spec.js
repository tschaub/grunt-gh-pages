const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('deep-base', () => {
  let fixture;
  let repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('deep-base', (error, dir) => {
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
    let branch;
    helper
      .git(['rev-parse', '--abbrev-ref', 'HEAD'], repo)
      .progress(chunk => {
        branch = String(chunk);
      })
      .then(() => {
        assert.strictEqual(branch, 'gh-pages\n', 'branch created');
        done();
      })
      .fail(done);
  });

  it('copies source files relative to the base', done => {
    fs.exists(path.join(repo, 'hello.txt'), exists => {
      if (exists) {
        done();
      } else {
        done(new Error('Failed to find "hello.txt" in repo: ') + repo);
      }
    });
  });

  it('pushes the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo)
      .then(() => {
        done();
      })
      .fail(done);
  });
});
