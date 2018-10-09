const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('multitask', () => {
  let fixture;
  let repo1;
  let repo2;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('multitask', (error, dir) => {
      if (error) {
        return done(error);
      }
      fixture = dir;
      repo1 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/first');
      repo2 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/second');
      done();
    });
  });

  after(done => {
    helper.afterFixture(fixture, done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/first directory', done => {
    fs.stat(repo1, (error, stats) => {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/second directory', done => {
    fs.stat(repo2, (error, stats) => {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('pushes the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo1)
      .then(() => {
        done();
      })
      .fail(done);
  });

  it('pushes the branch-two branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/branch-two'], repo2)
      .then(() => {
        done();
      })
      .fail(done);
  });
});
