const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const assert = helper.assert;

describe('different-repo', () => {
  let fixture;
  let repo;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('different-repo', (error, dir) => {
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

  it('copies source files', done => {
    fs.exists(path.join(repo, 'hello.txt'), exists => {
      if (!exists) {
        done(new Error('Failed to find "hello.txt" in repo: ') + repo);
      } else {
        done();
      }
    });
  });

  it('copies correct source files', done => {
    fs.readFile(path.join(repo, 'hello.txt'), (err, data) => {
      if (err) {
        done(err);
      } else {
        assert.strictEqual(String(data), 'hello\n');
        done();
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
