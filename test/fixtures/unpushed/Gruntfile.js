const git = require('../../../lib/git');
const path = require('path');

/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {
  grunt.initConfig({
    'gh-pages': {
      options: {
        repo: path.resolve('./repo'),
        push: false,
        user: {
          name: 'My Name',
          email: 'mail@example.com'
        }
      },
      src: ['hello.txt']
    }
  });

  grunt.loadTasks('../../../tasks');

  grunt.registerTask('init', function() {
    const done = this.async();
    const cwd = path.join(__dirname, 'repo');
    git
      .init(cwd)
      .then(function() {
        return git.add('.', cwd);
      })
      .then(function() {
        return git(['config', 'user.email', 'mail@example.com'], cwd);
      })
      .then(function() {
        return git(['config', 'user.name', 'My Name'], cwd);
      })
      .then(function() {
        return git.commit('Initial commit', cwd);
      })
      .then(done, done);
  });

  grunt.registerTask('default', ['init', 'gh-pages']);
};
