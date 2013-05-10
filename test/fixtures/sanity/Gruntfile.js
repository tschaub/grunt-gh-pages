

/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.initConfig({
    'gh-pages': {
      repo: 'git@example.com:foo/bar.git',
      src: ['hello.txt']
    }
  });

  grunt.loadTasks('../../../tasks');

  grunt.registerTask('default', 'gh-pages');

};
