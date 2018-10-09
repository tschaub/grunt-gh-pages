const tmp = require('tmp');
const git = require('../../../lib/git');

/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {
  grunt.initConfig({
    'gh-pages': {
      options: {
        user: {
          name: 'My Name',
          email: 'mail@example.com'
        }
      },
      first: {
        options: {
          base: 'first'
        },
        src: '**/*'
      },
      // we want this target to add new files and not remove existing ones
      second: {
        options: {
          base: 'second',
          add: true
        },
        src: '**/*'
      }
    }
  });

  grunt.loadTasks('../../../tasks');

  grunt.registerTask('init', function() {
    const done = this.async();
    tmp.dir((error, remote) => {
      if (error) {
        return done(error);
      }
      git(['init', '--bare'], remote)
        .then(() => {
          return git.init(__dirname);
        })
        .then(() => {
          return git.add('Gruntfile.js', __dirname);
        })
        .then(() => {
          return git(['config', 'user.email', 'mail@example.com'], __dirname);
        })
        .then(() => {
          return git(['config', 'user.name', 'My Name'], __dirname);
        })
        .then(() => {
          return git.commit('Initial commit', __dirname);
        })
        .then(() => {
          return git(['remote', 'add', 'origin', remote], __dirname);
        })
        .then(() => {
          return git(['push', 'origin', 'master'], __dirname);
        })
        .then(done, done);
    });
  });

  grunt.registerTask('default', ['init', 'gh-pages:first', 'gh-pages:second']);
};
