var path = require('path');
var cp = require('child_process');
var fs = require('fs');

var tmp = require('tmp');
var wrench = require('wrench');

var fixtures = path.join(__dirname, 'fixtures');


/**
 * Spawn a Grunt process.
 * @param {string} dir Directory with Gruntfile.js.
 * @param {Array.<string>} args Arguments to pass to grunt.
 * @param {function(Error, Process)} callback Callback.
 */
exports.spawnGrunt = function(dir, args, callback) {
  if (!fs.existsSync(path.join(dir, 'Gruntfile.js'))) {
    callback(new Error('Cannot find Gruntfile.js in dir: ') + dir);
  } else {
    var node = process.argv[0];
    var grunt = process.argv[1]; // assumes grunt drives these tests
    var child = cp.spawn(node, [grunt], {cwd: dir});
    callback(null, child);
  }
};


/**
 * Set up before running tests.
 * @param {string} name Fixture name.
 * @param {function} done Callback.
 */
exports.beforeFixture = function(name, done) {
  var fixture = path.join(fixtures, name);
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
  }

  tmp.dir({dir: './tmp'}, function(error, dir) {
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
