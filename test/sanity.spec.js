var fs = require('fs');

var chai = require('chai');

var helper = require('./helper');


/** @type {boolean} */
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe('sanity', function() {
  var fixture;
  before(function(done) {
    helper.beforeFixture('sanity', function(error, dir) {
      fixture = dir;
      done(error);
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });

  it('exists', function(done) {
    fs.stat(fixture, function(error, stats) {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('grunts', function(done) {
    helper.spawnGrunt(fixture, [], function(error, child) {
      if (error) {
        return done(error);
      }
      var messages = [];
      child.stderr.on('data', function(chunk) {
        messages.push(chunk.toString());
      });
      child.stdout.on('data', function(chunk) {
        messages.push(chunk.toString());
      });
      child.on('close', function(code) {
        if (code !== 0) {
          done(new Error('Task failed: ' + messages.join('')));
        } else {
          assert.ok(true, 'it grunts');
          done();
        }
      });
    });
  });

});
