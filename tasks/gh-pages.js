var path = require('path');

var Q = require('q');

var pkg = require('../package.json');
var git = require('../lib/git');

var copy = require('../lib/util').copy;

function getRepo(options) {
  if (options.repo) {
    return Q.resolve(options.repo);
  } else {
    var repo;
    return git(['config', '--get', 'remote.origin.url'],
        process.cwd())
        .progress(function(chunk) {
          repo = String(chunk).split(/[\n\r]/).shift();
        })
        .then(function() {
          if (repo) {
            return Q.resolve(repo);
          } else {
            return Q.reject(new Error(
                'Failed to get repo URL from options or current directory.'));
          }
        })
        .fail(function(err) {
          return Q.reject(new Error(
              'Failed to get remote.origin.url (task must either be run in a ' +
              'git repository with a configured origin remote or must be ' +
              'configured with the "repo" option).'));
        });
  }
}


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.registerMultiTask('gh-pages', 'Publish to gh-pages.', function() {

    var src;
    var data = this.data;
    var kind = grunt.util.kindOf(data);
    if (kind === 'string') {
      src = [data];
    } else if (kind === 'array') {
      src = data;
    } else if (kind === 'object') {
      if (!('src' in data)) {
        grunt.fatal(new Error('Required "src" property missing.'));
      }
      src = data.src;
    } else {
      grunt.fatal(new Error('Unexpected config: ' + String(data)));
    }

    var defaults = {
      add: false,
      git: 'git',
      clone: path.join('.grunt', pkg.name, this.name, this.target),
      branch: 'gh-pages',
      remote: 'origin',
      base: process.cwd(),
      only: '.',
      push: true,
      message: 'Updates',
      silent: false
    };

    // override defaults with any task options
    var options = this.options(defaults);

    // allow command line options to override
    var value;
    for (var option in defaults) {
      value = grunt.option(pkg.name + '-' + option);
      if (value !== undefined) {
        options[option] = value;
      }
    }

    if (!grunt.file.isDir(options.base)) {
      grunt.fatal(new Error('The "base" option must be an existing directory'));
    }

    var files = grunt.file.expand({filter: 'isFile', cwd: options.base}, src);
    var only = grunt.file.expand({cwd: options.base}, options.only);
    if (!Array.isArray(files) || files.length === 0) {
      grunt.fatal(new Error('Files must be provided in the "src" property.'));
    }

    var done = this.async();

    function log(message) {
      if (!options.silent) {
        grunt.log.writeln(message);
      }
    }

    git.exe(options.git);

    getRepo(options)
        .then(function(repo) {
          log('Cloning ' + repo + ' into ' + options.clone);
          return git.clone(repo, options.clone, options.branch, options);
        })
        .then(function() {
          // only required if someone mucks with the checkout between builds
          log('Cleaning');
          return git.clean(options.clone);
        })
        .then(function() {
          log('Fetching ' + options.remote);
          return git.fetch(options.remote, options.branch, options.clone);
        })
        .then(function() {
          log('Checking out ' + options.remote + '/' +
              options.branch);
          return git.checkout(options.remote, options.branch,
              options.clone);
        })
        .then(function() {
          if (!options.add) {
            log('Removing files');
            return git.rm(only.join(' '), options.clone);
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          log('Copying files');
          return copy(files, options.base, options.clone);
        })
        .then(function() {
          log('Adding all');
          return git.add('.', options.clone);
        })
        .then(function() {
          if (options.user) {
            return git(['config', 'user.email', options.user.email],
                options.clone)
                .then(function() {
                  return git(['config', 'user.name', options.user.name],
                      options.clone);
                });
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          log('Committing');
          return git.commit(options.message, options.clone);
        })
        .then(function() {
          if (options.tag) {
            log('Tagging');
            var deferred = Q.defer();
            git.tag(options.tag, options.clone)
              .then(function() {
                  return deferred.resolve();
                })
              .fail(function(error) {
                  // tagging failed probably because this tag alredy exists
                  log('Tagging failed, continuing');
                  grunt.log.debug(error);
                  return deferred.resolve();
                });
            return deferred.promise;
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          if (options.push) {
            log('Pushing');
            return git.push(options.remote, options.branch,
                options.clone);
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          done();
        }, function(error) {
          if (options.silent) {
            error = new Error(
                'Unspecified error (run without silent option for detail)');
          }
          done(error);
        }, function(progress) {
          grunt.verbose.writeln(progress);
        });
  });

};
