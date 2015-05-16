var path = require('path');

var async = require('async');
var fs = require('graceful-fs');
var Q = require('q');


/**
 * Generate a list of unique directory paths given a list of file paths.
 * @param {Array.<string>} files List of file paths.
 * @return {Array.<string>} List of directory paths.
 */
var uniqueDirs = exports.uniqueDirs = function(files) {
  var dirs = {};
  files.forEach(function(filepath) {
    var parts = path.dirname(filepath).split(path.sep);
    var partial = parts[0];
    dirs[partial] = true;
    for (var i = 1, ii = parts.length; i < ii; ++i) {
      partial = path.join(partial, parts[i]);
      dirs[partial] = true;
    }
  });
  return Object.keys(dirs);
};


/**
 * Sort function for paths.  Sorter paths come first.  Paths of equal length are
 * sorted alphanumerically in path segment order.
 * @param {string} a First path.
 * @param {string} b Second path.
 * @return {number} Comparison.
 */
var byShortPath = exports.byShortPath = function(a, b) {
  var aParts = a.split(path.sep);
  var bParts = b.split(path.sep);
  var aLength = aParts.length;
  var bLength = bParts.length;
  var cmp = 0;
  if (aLength < bLength) {
    cmp = -1;
  } else if (aLength > bLength) {
    cmp = 1;
  } else {
    var aPart, bPart;
    for (var i = 0; i < aLength; ++i) {
      aPart = aParts[i];
      bPart = bParts[i];
      if (aPart < bPart) {
        cmp = -1;
        break;
      } else if (aPart > bPart) {
        cmp = 1;
        break;
      }
    }
  }
  return cmp;
};


/**
 * Generate a list of directories to create given a list of file paths.
 * @param {Array.<string>} files List of file paths.
 * @return {Array.<string>} List of directory paths ordered by path length.
 */
var dirsToCreate = exports.dirsToCreate = function(files) {
  return uniqueDirs(files).sort(byShortPath);
};


/**
 * Copy a file.
 * @param {Object} obj Object with src and dest properties.
 * @param {function(Error)} callback Callback
 */
var copyFile = exports.copyFile = function(obj, callback) {
  var called = false;
  function done(err) {
    if (!called) {
      called = true;
      callback(err);
    }
  }

  var read = fs.createReadStream(obj.src);
  read.on('error', function(err) {
    done(err);
  });

  var write = fs.createWriteStream(obj.dest);
  write.on('error', function(err) {
    done(err);
  });
  write.on('close', function(ex) {
    done();
  });

  read.pipe(write);
};


/**
 * Make directory, ignoring errors if directory already exists.
 * @param {string} path Directory path.
 * @param {function(Error)} callback Callback.
 */
function makeDir(path, callback) {
  fs.mkdir(path, function(err) {
    if (err) {
      // check if directory exists
      fs.stat(path, function(err2, stat) {
        if (err2 || !stat.isDirectory()) {
          callback(err);
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  });
}


/**
 * Copy a list of files.
 * @param {Array.<string>} files Files to copy.
 * @param {string} base Base directory.
 * @param {string} dest Destination directory.
 * @return {Promise} A promise.
 */
var copy = exports.copy = function(files, base, dest) {
  var deferred = Q.defer();

  var pairs = [];
  var destFiles = [];
  files.forEach(function(file) {
    var src = path.resolve(base, file);
    var relative = path.relative(base, src);
    var target = path.join(dest, relative);
    pairs.push({
      src: src,
      dest: target
    });
    destFiles.push(target);
  });

  async.eachSeries(dirsToCreate(destFiles), makeDir, function(err) {
    if (err) {
      return deferred.reject(err);
    }
    async.each(pairs, copyFile, function(err) {
      if (err) {
        return deferred.reject(err);
      } else {
        return deferred.resolve();
      }
    });
  });

  return deferred.promise;
};

/**
 * Replace a regex in given files.
 * @param {Array.<string>} files Files to apply replace to.
 * @param {string} regex Regex to apply.
 * @param {string} replacement Replacement string.
 */
var inFileReplace = exports.inFileReplace = function(files, base, regex, replacement) {
  var deferred = Q.defer();

  async.each(files, function(file, callback) {
    var src = path.resolve(base, file);
    fs.readFile(src, 'utf8', function(err, data) {
      if (err) {
        callback(err);
        return;
      }
      var result = data.replace(regex, replacement);
      fs.writeFile(src, result, 'utf8', function(err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    });
  }, function(err) {
    if (err) {
      return deferred.reject(err);
    } else {
      return deferred.resolve();
    }
  });

  return deferred.promise;
};

/**
 * Replace regexes in given files.
 * @param {Array.<obj>} replaceList List of objects containing replace settings.
 */
var replaceInFiles = exports.replaceInFiles = function(replaceList) {
  var deferred = Q.defer();

  async.eachSeries(replaceList, function(replaceObj, callback) {
    var replacePromise = inFileReplace(replaceObj.files, replaceObj.base, replaceObj.regex, replaceObj.replacement);
    replacePromise.then(function() {
      callback();
      return;
    }, function(err) {
      callback(err);
      return;
    });
  }, function(err) {
    if (err) {
      return deferred.reject(err);
    }
    return deferred.resolve();
  });

  return deferred.promise;
};
