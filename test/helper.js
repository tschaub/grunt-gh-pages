const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const chai = require('chai');
const tmp = require('tmp');

const fixtures = path.join(__dirname, 'fixtures');
const tmpDir = 'tmp';

/**
 * Spawn a Grunt process.
 * @param {string} dir Directory with Gruntfile.js.
 * @param {function(Error, Process)} done Callback.
 */
function spawnGrunt(dir, done) {
  if (fs.existsSync(path.join(dir, 'Gruntfile.js'))) {
    const node = process.argv[0];
    const grunt = process.argv[1]; // assumes grunt drives these tests
    const child = cp.spawn(node, [grunt, '--verbose'], {cwd: dir});
    done(null, child);
  } else {
    done(new Error(`Cannot find Gruntfile.js in dir: ${dir}`));
  }
}

/**
 * Set up before running tests.
 * @param {string} name Fixture name.
 * @param {function} done Callback.
 */
function cloneFixture(name, done) {
  const fixture = path.join(fixtures, name);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  tmp.dir({dir: tmpDir}, (error, dir) => {
    if (error) {
      return done(error);
    }
    const scratch = path.join(dir, name);
    fse.copy(fixture, scratch, error => {
      done(error, scratch);
    });
  });
}

/**
 * Clone a fixture and run the default Grunt task in it.
 * @param {string} name Fixture name.
 * @param {function(Error, scratch)} done Called with an error if the task
 *     fails.  Called with the cloned fixture directory if the task succeeds.
 */
exports.buildFixture = function(name, done) {
  cloneFixture(name, (error, scratch) => {
    if (error) {
      return done(error);
    }
    spawnGrunt(scratch, (error, child) => {
      if (error) {
        return done(error);
      }
      const messages = [];
      child.stderr.on('data', chunk => {
        messages.push(chunk.toString());
      });
      child.stdout.on('data', chunk => {
        messages.push(chunk.toString());
      });
      child.on('close', code => {
        if (code === 0) {
          done(null, scratch);
        } else {
          done(new Error(`Task failed: ${messages.join('')}`));
        }
      });
    });
  });
};

/**
 * Clean up after running tests.
 * @param {string} scratch Path to scratch directory.
 * @param {function} done Callback.
 */
exports.afterFixture = function(scratch, done) {
  let error;
  try {
    fse.removeSync(scratch);
    fse.removeSync(tmpDir);
  } catch (err) {
    error = err;
  }
  done(error);
};

/**
 * Util function for handling spawned git processes as promises.
 * @param {Array.<string>} args Arguments.
 * @param {string} cwd Working directory.
 * @return {Promise} A promise.
 */
exports.git = require('../lib/git');

/** @type {boolean} */
chai.config.includeStack = true;

/**
 * Chai's assert function configured to include stacks on failure.
 * @type {function}
 */
exports.assert = chai.assert;
