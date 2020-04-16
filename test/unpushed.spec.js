const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('unpushed', () => {
  let fixture;
  let repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('unpushed', (error, dir) => {
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

  it('does not push the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo)
      .then(() => {
        done(new Error('Expected not to find origin/gh-pages'));
      })
      .catch(() => {
        // failure on the ls-remote is what we're looking for (no push)
        done();
      });
  });
});
