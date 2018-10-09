const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('custom-clone-dir', () => {
  let fixture;
  let repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('custom-clone-dir', (error, dir) => {
      if (error) {
        return done(error);
      }
      fixture = dir;
      repo = path.join(fixture, 'clone-dir');
      done();
    });
  });

  after(done => {
    helper.afterFixture(fixture, done);
  });

  it('creates clone-dir directory', done => {
    fs.stat(repo, (error, stats) => {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
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
