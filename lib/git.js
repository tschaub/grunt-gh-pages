const cp = require('child_process');
const path = require('path');
const util = require('util');
const fse = require('fs-extra');

let git = 'git';

/**
 * @constructor
 * @param {number} code Error code.
 * @param {string} message Error message.
 */
function ProcessError(code, message) {
  const callee = arguments.callee;
  Error.apply(this, [message]);
  Error.captureStackTrace(this, callee);
  this.code = code;
  this.message = message;
  this.name = callee.name;
}
util.inherits(ProcessError, Error);

/**
 * Execute a git command.
 * @param {Array.<string>} args Arguments (e.g. ['remote', 'update']).
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.  The promise will be resolved with stdout as a string
 *     or rejected with an error.
 */
exports = module.exports = function(args, cwd) {
  return spawn(git, args, cwd);
};

/**
 * Set the Git executable to be used by exported methods (defaults to 'git').
 * @param {string} exe Git executable (full path if not already on path).
 */
exports.exe = function(exe) {
  git = exe;
};

/**
 * Util function for handling spawned processes as promises.
 * @param {string} exe Executable.
 * @param {Array.<string>} args Arguments.
 * @param {string} cwd Working directory.
 * @return {Promise} A promise.
 */
function spawn(exe, args, cwd) {
  const promise = new Promise((resolve, reject) => {
    const child = cp.spawn(exe, args, {cwd: cwd || process.cwd()});
    const stderrBuffer = [];
    const stdoutBuffer = [];
    child.stderr.on('data', chunk => {
      stderrBuffer.push(chunk.toString());
    });
    child.stdout.on('data', chunk => {
      stdoutBuffer.push(chunk.toString());
    });
    child.on('close', code => {
      if (code) {
        const msg = stderrBuffer.join('') || `Process failed: ${code}`;
        reject(new ProcessError(code, msg));
      } else {
        resolve(stdoutBuffer.join(''));
      }
    });
  });
  return promise;
}

/**
 * Initialize repository.
 * @param {string} cwd Repository directory.
 * @return {ChildProcess} Child process.
 */
exports.init = function init(cwd) {
  return spawn(git, ['init'], cwd);
};

/**
 * Clone a repo into the given dir if it doesn't already exist.
 * @param {string} repo Repository URL.
 * @param {string} dir Target directory.
 * @param {string} branch Branch name.
 * @param {options} options All options.
 * @return {Promise} A promise.
 */
exports.clone = function clone(repo, dir, branch, options) {
  return fse.pathExists(dir).then(exists => {
    if (exists) {
      return Promise.resolve();
    }
    return fse.ensureDir(path.dirname(path.resolve(dir))).then(() => {
      const args = ['clone', repo, dir, '--branch', branch, '--single-branch'];
      if (options.depth) {
        args.push('--depth', options.depth);
      }
      return spawn(git, args).catch(err => {
        // try again without branch options
        return spawn(git, ['clone', repo, dir]);
      });
    });
  });
};

/**
 * Clean up unversioned files.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
const clean = (exports.clean = function clean(cwd) {
  return spawn(git, ['clean', '-f', '-d'], cwd);
});

/**
 * Hard reset to remote/branch
 * @param {string} remote Remote alias.
 * @param {string} branch Branch name.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
const reset = (exports.reset = function reset(remote, branch, cwd) {
  return spawn(git, ['reset', '--hard', `${remote}/${branch}`], cwd);
});

/**
 * Fetch from a remote.
 * @param {string} remote Remote alias.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.fetch = function fetch(remote, cwd) {
  return spawn(git, ['fetch', remote], cwd);
};

/**
 * Checkout a branch (create an orphan if it doesn't exist on the remote).
 * @param {string} remote Remote alias.
 * @param {string} branch Branch name.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.checkout = function checkout(remote, branch, cwd) {
  const treeish = `${remote}/${branch}`;
  return spawn(git, ['ls-remote', '--exit-code', '.', treeish], cwd).then(
    () => {
      // branch exists on remote, hard reset
      return spawn(git, ['checkout', branch], cwd)
        .then(() => {
          return clean(cwd);
        })
        .then(() => {
          return reset(remote, branch, cwd);
        });
    },
    error => {
      if (error instanceof ProcessError && error.code === 2) {
        // branch doesn't exist, create an orphan
        return spawn(git, ['checkout', '--orphan', branch], cwd);
      }
      // unhandled error
      return Promise.reject(error);
    }
  );
};

/**
 * Remove all unversioned files.
 * @param {string} files Files argument.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.rm = function rm(files, cwd) {
  return spawn(git, ['rm', '--ignore-unmatch', '-r', '-f', files], cwd);
};

/**
 * Add files.
 * @param {string} files Files argument.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.add = function add(files, cwd) {
  return spawn(git, ['add', files], cwd);
};

/**
 * Commit.
 * @param {string} message Commit message.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.commit = function commit(message, cwd) {
  return spawn(git, ['diff-index', '--quiet', 'HEAD', '.'], cwd)
    .then(() => {
      // nothing to commit
      return Promise.resolve();
    })
    .catch(() => {
      return spawn(git, ['commit', '-m', message], cwd);
    });
};

/**
 * Add tag
 * @param {string} tag Name of tag.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.tag = function tag(tag, cwd) {
  return spawn(git, ['tag', tag], cwd);
};

/**
 * Push a branch.
 * @param {string} remote Remote alias.
 * @param {string} branch Branch name.
 * @param {string} cwd Repository directory.
 * @return {Promise} A promise.
 */
exports.push = function push(remote, branch, cwd) {
  return spawn(git, ['push', '--tags', remote, branch], cwd);
};
