/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {
  const tasksSrc = 'tasks/**/*.js';
  const testSrc = 'test/**/*.js';
  const fixturesSrc = 'test/fixtures/**/*.js';

  grunt.initConfig({
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      all: {
        src: testSrc,
        newer: true
      }
    },
    watch: {
      tasks: {
        files: tasksSrc,
        tasks: ['mochaTest']
      },
      test: {
        files: testSrc,
        tasks: ['mochaTest']
      },
      fixtures: {
        files: fixturesSrc,
        tasks: ['mochaTest']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', ['test']);
};
