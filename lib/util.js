var path = require('path');


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
