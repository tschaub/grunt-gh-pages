

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var _ = grunt.util._;

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
      require: false,
      __dirname: false
    }
  };

  var testLintOptions = _.clone(lintOptions, true);
  _.merge(testLintOptions.globals, {
    it: false,
    describe: false,
    before: false,
    beforeEach: false,
    after: false,
    afterEach: false
  });

  var tasksSrc = 'tasks/**/*.spec.js';
  var testSrc = 'test/**/*.js';
  var fixturesSrc = 'test/fixtures/**/*.js';

  grunt.initConfig({
    cafemocha: {
      options: {
        reporter: 'spec'
      },
      all: {
        src: testSrc
      }
    },
    jshint: {
      gruntfile: {
        options: lintOptions,
        src: 'Gruntfile.js'
      },
      tasks: {
        options: lintOptions,
        src: tasksSrc
      },
      test: {
        options: testLintOptions,
        src: testSrc
      },
      fixtures: {
        options: lintOptions,
        src: fixturesSrc
      }
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile']
      },
      tasks: {
        files: tasksSrc,
        tasks: ['jshint:tasks', 'cafemocha']
      },
      test: {
        files: testSrc,
        tasks: ['jshint:test', 'cafemocha']
      },
      fixtures: {
        files: fixturesSrc,
        tasks: ['jshint:fixtures', 'cafemocha']
      }
    }
  });

  grunt.loadNpmTasks('grunt-cafe-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'cafemocha']);

  grunt.registerTask('default', ['test']);

};
