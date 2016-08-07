/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var tasksSrc = 'tasks/**/*.js';
  var testSrc = 'test/**/*.js';
  var fixturesSrc = 'test/fixtures/**/*.js';

  grunt.initConfig({
    cafemocha: {
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
        tasks: ['cafemocha']
      },
      test: {
        files: testSrc,
        tasks: ['cafemocha']
      },
      fixtures: {
        files: fixturesSrc,
        tasks: ['cafemocha']
      }
    }
  });

  grunt.loadNpmTasks('grunt-cafe-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['cafemocha']);

  grunt.registerTask('default', ['test']);

};
