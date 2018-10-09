const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('add', () => {
  let fixture;
  let repo1;
  let repo2;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('add', (error, dir) => {
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

  /**
   * First target adds all files from `first` directory.
   */
  it('creates .grunt/grunt-gh-pages/gh-pages/first directory', done => {
    fs.stat(repo1, (error, stats) => {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
    });
  });

  it('creates a gh-pages branch', done => {
    let branch;
    helper
      .git(['rev-parse', '--abbrev-ref', 'HEAD'], repo1)
      .progress(chunk => {
        branch = String(chunk);
      })
      .then(() => {
        assert.strictEqual(branch, 'gh-pages\n', 'branch created');
        done();
      })
      .fail(done);
  });

  it('copies source files relative to the base', () => {
    assert.strictEqual(
      fs.readFileSync(path.join(repo1, 'first.txt'), 'utf8'),
      'first'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(repo1, 'sub', 'sub.txt'), 'utf8'),
      'first'
    );
  });

  it('pushes the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo1)
      .then(() => {
        done();
      })
      .fail(done);
  });

  /**
   * Second target adds all files from `second` directory without removing those
   * from the `first`.
   */
  it('creates .grunt/grunt-gh-pages/gh-pages/second directory', done => {
    fs.stat(repo2, (error, stats) => {
      if (error) {
        return done(error);
      }
      assert.isTrue(stats.isDirectory(), 'directory');
      done();
    });
  });

  it('creates a gh-pages branch', done => {
    let branch;
    helper
      .git(['rev-parse', '--abbrev-ref', 'HEAD'], repo2)
      .progress(chunk => {
        branch = String(chunk);
      })
      .then(() => {
        assert.strictEqual(branch, 'gh-pages\n', 'branch created');
        done();
      })
      .fail(done);
  });

  it('overwrites, but does not remove existing', () => {
    assert.strictEqual(
      fs.readFileSync(path.join(repo2, 'first.txt'), 'utf8'),
      'first'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(repo2, 'second.txt'), 'utf8'),
      'second'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(repo2, 'sub', 'sub.txt'), 'utf8'),
      'second'
    );
  });

  it('pushes the gh-pages branch to remote', done => {
    helper
      .git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo2)
      .then(() => {
        done();
      })
      .fail(done);
  });
});
