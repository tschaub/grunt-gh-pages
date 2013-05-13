var path = require('path');

var git = require('../../../lib/git');


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.initConfig({
    'gh-pages': {
      repo: './repo',
      src: ['hello.txt']
    }
  });

  grunt.loadTasks('../../../tasks');

  grunt.registerTask('init', function() {
    var done = this.async();
    var cwd = path.join(__dirname, 'repo');
    git.init(cwd)
        .then(function() {
          return git.add('.', cwd);
        })
        .then(function() {
          return git.commit('Initial commit', cwd);
        })
        .then(done, done);

  });

  grunt.registerTask('default', ['init', 'gh-pages']);

};
