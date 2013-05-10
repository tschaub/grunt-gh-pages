var cp = require('child_process');
var path = require('path');
var util = require('util');

var Q = require('q');
var fs = require('q-io/fs');

var pkg = require('../package.json');



/**
 * @constructor
 * @param {number} code Error code.
 * @param {string} message Error message.
 */
function ProcessError(code, message) {
  var callee = arguments.callee;
  Error.apply(this, [message]);
  Error.captureStackTrace(this, callee);
  this.code = code;
  this.message = message;
  this.name = callee.name;
}
util.inherits(ProcessError, Error);


// util function for handling spawned processes as promises
function spawn(exe, args, cwd) {
  var deferred = Q.defer();
  var child = cp.spawn(exe, args, {cwd: cwd || process.cwd()});
  var buffer = [];
  child.stderr.on('data', function(chunk) {
    buffer.push(chunk.toString());
  });
  child.stdout.on('data', function(chunk) {
    deferred.notify(chunk.toString());
  });
  child.on('exit', function(code) {
    if (code) {
      var msg = buffer.join('') || 'Process failed: ' + code;
      deferred.reject(new ProcessError(code, msg));
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

// copy files to a destination directory
function copy(files, base, dest) {
  return Q.all(files.map(function(file) {
    var relative = path.relative(base, file);
    var target = path.join(dest, relative);
    return fs.makeTree(path.dirname(target)).then(function() {
      return fs.copy(file, target);
    });
  }));
}

// clone a repo into the given dir if it doesn't already exist
function clone(git, repo, dir) {
  return fs.exists(dir).then(function(exists) {
    return exists ? Q.resolve() : spawn(git, ['clone', repo, dir]);
  });
}

// clean up unversioned files
function clean(git, cwd) {
  return spawn(git, ['clean', '-f', '-d'], cwd);
}

// hard reset to remote/branch
function reset(git, remote, branch, cwd) {
  return spawn(git, ['reset', '--hard', remote + '/' + branch], cwd);
}

// fetch from a remote
function fetch(git, remote, cwd) {
  return spawn(git, ['fetch', remote], cwd);
}

// checkout a branch (create an orphan if it doesn't exist on the remote)
function checkout(git, remote, branch, cwd) {
  var treeish = remote + '/' + branch;
  return spawn(git, ['ls-remote', '--exit-code', '.', treeish], cwd)
      .then(function() {
        // branch exists on remote, hard reset
        return spawn(git, ['checkout', branch], cwd)
            .then(function() {
              return clean(git, cwd);
            })
            .then(function() {
              return reset(git, remote, branch, cwd);
            });
      }, function(error) {
        if (error instanceof ProcessError && error.code === 2) {
          // branch doesn't exist, create an orphan
          return spawn(git, ['checkout', '--orphan', branch], cwd);
        } else {
          // unhandled error
          return Q.reject(error);
        }
      });
}

// remove files
function rm(git, files, cwd) {
  return spawn(git, ['rm', '--ignore-unmatch', '-r', '-f', files], cwd);
}

// add files
function add(git, files, cwd) {
  return spawn(git, ['add', files], cwd);
}

// commit
function commit(git, message, cwd) {
  return spawn(git, ['diff-index', '--quiet', 'HEAD', '.'], cwd)
      .then(function() {
        // nothing to commit
        return Q.resolve();
      })
      .fail(function() {
        return spawn(git, ['commit', '-m', message], cwd);
      });
}

// push a branch
function push(git, remote, branch, cwd) {
  return spawn(git, ['push', remote, branch], cwd);
}


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.registerTask('gh-pages', 'Publish to gh-pages.', function() {
    this.requiresConfig([this.name, 'repo']);
    this.requiresConfig([this.name, 'src']);

    var repo = grunt.config([this.name, 'repo']);
    var files = grunt.file.expand({filter: 'isFile'},
        grunt.config([this.name, 'src']));
    if (!Array.isArray(files) || files.length === 0) {
      grunt.fatal(new Error('Files must be provided in the "src" property.'));
    }

    var options = this.options({
      git: 'git',
      clone: path.join('.grunt', pkg.name, this.name, 'repo'),
      branch: 'gh-pages',
      remote: 'origin',
      message: 'Updates'
    });

    var done = this.async();

    grunt.log.writeln('Cloning ' + repo + ' into ' + options.clone);
    clone(options.git, repo, options.clone)
        .then(function() {
          // only required if someone mucks with the checkout between builds
          grunt.log.writeln('Cleaning');
          return clean(options.git, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Fetching ' + options.remote);
          return fetch(options.git, options.remote, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Checking out ' + options.remote + '/' +
              options.branch);
          return checkout(options.git, options.remote, options.branch,
              options.clone);
        })
        .then(function() {
          grunt.log.writeln('Removing all');
          return rm(options.git, '.', options.clone);
        })
        .then(function() {
          grunt.log.writeln('Copying files');
          return copy(files, process.cwd(), options.clone);
        })
        .then(function() {
          grunt.log.writeln('Adding all');
          return add(options.git, '.', options.clone);
        })
        .then(function() {
          grunt.log.writeln('Committing');
          return commit(options.git, options.message, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Pushing');
          return push(options.git, options.remote, options.branch,
              options.clone);
        })
        .then(function() {
          done();
        }, function(error) {
          done(error);
        }, function(progress) {
          grunt.verbose.writeln(progress);
        });
  });

};
