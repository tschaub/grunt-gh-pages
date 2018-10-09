const path = require('path');
const fse = require('fs-extra');
const Q = require('q');
const urlSafe = require('url-safe');
const copy = require('../lib/util').copy;
const git = require('../lib/git');
const pkg = require('../package.json');

function getCacheDir() {
  return path.join('.grunt', pkg.name);
}

function getRemoteUrl(dir, remote) {
  let repo;
  return git(['config', '--get', `remote.${remote}.url`], dir)
    .progress(chunk => {
      repo = String(chunk)
        .split(/[\n\r]/)
        .shift();
    })
    .then(() => {
      if (repo) {
        return Q.resolve(repo);
      }
      return Q.reject(
        new Error('Failed to get repo URL from options or current directory.')
      );
    })
    .fail(err => {
      return Q.reject(
        new Error(
          'Failed to get remote.origin.url (task must either be run in a ' +
            'git repository with a configured origin remote or must be ' +
            'configured with the "repo" option).'
        )
      );
    });
}

function getRepo(options) {
  if (options.repo) {
    return Q.resolve(options.repo);
  }
  return getRemoteUrl(process.cwd(), 'origin');
}

/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {
  grunt.registerMultiTask('gh-pages', 'Publish to gh-pages.', function() {
    let src;
    const data = this.data;
    const kind = grunt.util.kindOf(data);
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
      grunt.fatal(new Error(`Unexpected config: ${String(data)}`));
    }

    const defaults = {
      add: false,
      git: 'git',
      clone: path.join(getCacheDir(), this.name, this.target),
      dotfiles: false,
      branch: 'gh-pages',
      remote: 'origin',
      base: process.cwd(),
      only: '.',
      push: true,
      message: 'Updates',
      silent: false
    };

    // override defaults with any task options
    const options = this.options(defaults);

    // allow command line options to override
    let value;
    for (const option in defaults) {
      value = grunt.option(`${pkg.name}-${option}`);
      if (value !== undefined) {
        options[option] = value;
      }
    }

    if (!grunt.file.isDir(options.base)) {
      grunt.fatal(new Error('The "base" option must be an existing directory'));
    }

    const files = grunt.file.expand(
      {
        filter: 'isFile',
        cwd: options.base,
        dot: options.dotfiles
      },
      src
    );

    if (!Array.isArray(files) || files.length === 0) {
      grunt.fatal(new Error('Files must be provided in the "src" property.'));
    }

    const only = grunt.file.expand({cwd: options.base}, options.only);

    const done = this.async();

    function log(message) {
      if (!options.silent) {
        grunt.log.writeln(message);
      }
    }

    git.exe(options.git);

    let repoUrl;
    getRepo(options)
      .then(repo => {
        repoUrl = repo;
        log(`Cloning ${urlSafe(repo, '[secure]')} into ${options.clone}`);
        return git.clone(repo, options.clone, options.branch, options);
      })
      .then(() => {
        return getRemoteUrl(options.clone, options.remote).then(url => {
          if (url !== repoUrl) {
            const message =
              `Remote url mismatch.  Got "${url}" ` +
              `but expected "${repoUrl}" in ${options.clone}.  ` +
              'If you have changed your "repo" option, try ' +
              'running `grunt gh-pages-clean` first.';
            return Q.reject(new Error(message));
          }
          return Q.resolve();
        });
      })
      .then(() => {
        // only required if someone mucks with the checkout between builds
        log('Cleaning');
        return git.clean(options.clone);
      })
      .then(() => {
        log(`Fetching ${options.remote}`);
        return git.fetch(options.remote, options.clone);
      })
      .then(() => {
        log(`Checking out ${options.remote}/${options.branch}`);
        return git.checkout(options.remote, options.branch, options.clone);
      })
      .then(() => {
        if (!options.add) {
          log('Removing files');
          return git.rm(only.join(' '), options.clone);
        }
        return Q.resolve();
      })
      .then(() => {
        log('Copying files');
        return copy(files, options.base, options.clone);
      })
      .then(() => {
        log('Adding all');
        return git.add('.', options.clone);
      })
      .then(() => {
        if (options.user) {
          return git(
            ['config', 'user.email', options.user.email],
            options.clone
          ).then(() => {
            return git(
              ['config', 'user.name', options.user.name],
              options.clone
            );
          });
        }
        return Q.resolve();
      })
      .then(() => {
        log('Committing');
        return git.commit(options.message, options.clone);
      })
      .then(() => {
        if (options.tag) {
          log('Tagging');
          const deferred = Q.defer();
          git
            .tag(options.tag, options.clone)
            .then(() => {
              return deferred.resolve();
            })
            .fail(error => {
              // tagging failed probably because this tag alredy exists
              log('Tagging failed, continuing');
              grunt.log.debug(error);
              return deferred.resolve();
            });
          return deferred.promise;
        }
        return Q.resolve();
      })
      .then(() => {
        if (options.push) {
          log('Pushing');
          return git.push(options.remote, options.branch, options.clone);
        }
        return Q.resolve();
      })
      .then(
        () => {
          done();
        },
        error => {
          if (options.silent) {
            error = new Error(
              'Unspecified error (run without silent option for detail)'
            );
          }
          done(error);
        },
        progress => {
          grunt.verbose.writeln(progress);
        }
      );
  });

  grunt.registerTask('gh-pages-clean', 'Clean cache dir', () => {
    fse.removeSync(getCacheDir());
  });
};
