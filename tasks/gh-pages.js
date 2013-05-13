var path = require('path');

var Q = require('q');
var fs = require('q-io/fs');

var pkg = require('../package.json');
var git = require('../lib/git');


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


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.registerTask('gh-pages', 'Publish to gh-pages.', function() {
    this.requiresConfig([this.name, 'repo']);
    this.requiresConfig([this.name, 'src']);

    var repo = grunt.config([this.name, 'repo']);
    var files = grunt.file.expand({filter: 'isFile', cwd: process.cwd()},
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

    git.exe(options.git);

    grunt.log.writeln('Cloning ' + repo + ' into ' + options.clone);
    git.clone(repo, options.clone)
        .then(function() {
          // only required if someone mucks with the checkout between builds
          grunt.log.writeln('Cleaning');
          return git.clean(options.clone);
        })
        .then(function() {
          grunt.log.writeln('Fetching ' + options.remote);
          return git.fetch(options.remote, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Checking out ' + options.remote + '/' +
              options.branch);
          return git.checkout(options.remote, options.branch,
              options.clone);
        })
        .then(function() {
          grunt.log.writeln('Removing all');
          return git.rm('.', options.clone);
        })
        .then(function() {
          grunt.log.writeln('Copying files');
          return copy(files, process.cwd(), options.clone);
        })
        .then(function() {
          grunt.log.writeln('Adding all');
          return git.add('.', options.clone);
        })
        .then(function() {
          grunt.log.writeln('Committing');
          return git.commit(options.message, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Pushing');
          return git.push(options.remote, options.branch,
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
