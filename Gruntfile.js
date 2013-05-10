

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var lintOptions = {
    curly: true,
    eqeqeq: true,
    indent: 2,
    latedef: true,
    newcap: true,
    nonew: true,
    quotmark: 'single',
    undef: true,
    trailing: true,
    maxlen: 80,
    globals: {
      exports: true,
      module: false,
      process: false,
      require: false
    }
  };

  grunt.initConfig({
    jshint: {
      gruntfile: {
        options: lintOptions,
        src: 'Gruntfile.js'
      },
      tasks: {
        options: lintOptions,
        src: 'tasks/**/*'
      }
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile']
      },
      tasks: {
        files: 'tasks/**/*',
        tasks: ['jshint:lib', 'cafemocha']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['test']);

};
