var path = require('path');

var tmp = require('tmp');
var wrench = require('wrench');

var fixtures = path.join(__dirname, 'fixtures');


/**
 * Set up before running tests.
 * @param {string} name Fixture name.
 * @param {function} done Callback.
 */
exports.beforeFixture = function(name, done) {
  var fixture = path.join(fixtures, name);

  tmp.dir(function(error, dir) {
    if (error) {
      return done(error);
    }
    var scratch = path.join(dir, name);
    wrench.copyDirRecursive(fixture, scratch, function(error) {
      done(error, scratch);
    });
  });
};


/**
 * Clean up after running tests.
 * @param {string} scratch Path to scratch directory.
 * @param {function} done Callback.
 */
exports.afterFixture = function(scratch, done) {
  var error;
  try {
    wrench.rmdirSyncRecursive(scratch, false);
  } catch (err) {
    error = err;
  }
  done(error);
};
