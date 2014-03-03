/*
 * grunt-templated-changelog
 *
 *
 * Copyright (c) 2014 Sergii Iavorskyi
 * Licensed under the MIT license.
 */

'use strict';

var fs    = require('fs');
var path  = require('path');
var sinon = require('sinon').sandbox.create();
var git   = require('./tasks/lib/git');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      tasks: [
        'Gruntfile.js',
        'tasks/**/*.js'
      ],
      tests: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: {src: ['test/**/*.js']}
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Run unit tests
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    },

    // Generate changelog with different presets
    changelog: {

      release: {
        options: {
          version: '<%= pkg.version %>',
          template: 'labeled'
        }
      },

      'test-options.changelog': {
        options: {
          changelog: 'tmp/options.changelog'
        }
      },

      'test-options.version': {
        options: {
          version: '9.9.9-build1',
          changelog: 'tmp/options.version'
        }
      },

      'test-options.changelog-prepend1': {
        options: {
          version: 'v0.0.1',
          changelog: 'tmp/options.changelog-prepend'
        }
      },

      'test-options.changelog-prepend2': {
        options: {
          version: 'v0.0.2',
          changelog: 'tmp/options.changelog-prepend'
        }
      },

      'test-options.nowrite': {
        options: {
          write: false,
          changelog: 'tmp/options.nowrite'
        }
      },

      'test-options.branch': {
        options: {
          branch: 'specific-branch',
          changelog: 'tmp/options.branch'
        }
      },

      'test-options.labels-all': {
        options: {
          template: 'labeled',
          changelog: 'tmp/options.labels-all'
        }
      },

      'test-options.labels': { // fix the order
        options: {
          template: 'labeled',
          labels: ['feature', 'bugfix'],
          changelog: 'tmp/options.labels'
        }
      },

      'test-options.template-simple': {
        options: {
          template: 'simple',
          changelog: 'tmp/options.template-simple'
        }
      },

      'test-options.template-labeled': {
        options: {
          template: 'labeled',
          changelog: 'tmp/options.template-labeled'
        }
      },

      'test-options.template-grouped': {
        options: {
          labels: ['feature', 'bugfix', 'style'],
          template: 'grouped',
          changelog: 'tmp/options.template-grouped'
        }
      },

      'test-options.template-path': {
        options: {
          template: 'test/fixtures/writer/default.tpl',
          changelog: 'tmp/options.template-path'
        }
      },

      'test-options.template.file': {
        options: {
          template: {
            file: 'test/fixtures/writer/default.tpl'
          },
          changelog: 'tmp/options.template.file'
        }
      },

      'test-options.template.data-object': {
        options: {
          template: {
            file: 'test/fixtures/writer/data.tpl',
            data: {things: [1,2,3,4,5,6,7,8,9,0]}
          },
          changelog: 'tmp/options.template.data-object'
        }
      },

      'test-options.template.data-function': {
        options: {
          template: {
            file: 'test/fixtures/writer/data.tpl',
            data: function(data) {
              data.things = [1,2,3,4,5,6,7,8,9,0];
              return data;
            }
          },
          changelog: 'tmp/options.template.data-function'
        }
      },

      'test-options.matchers-regexp': {
        options: {
          matchers: {
            marker: /@marker:(\d+)/i
          },
          changelog: 'tmp/options.matchers-regexp',
          template: 'test/fixtures/grunt/options.matchers.tpl'
        }
      },

      'test-options.matchers-function': {
        options: {
          matchers: {
            marker: function(body) {
              var matchs = body.match(/@marker:(\d+)/i);
              return matchs ? matchs[1] : null;
            }
          },
          changelog: 'tmp/options.matchers-function',
          template: 'test/fixtures/grunt/options.matchers.tpl'
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.

  grunt.registerTask('test', [
    'clean',
    'git-stub',

    'changelog:test-options.changelog',
    'changelog:test-options.version',
    'changelog:test-options.changelog-prepend1',
    'changelog:test-options.changelog-prepend2',
    'changelog:test-options.nowrite',
    'changelog:test-options.branch',
    'changelog:test-options.labels-all',
    'changelog:test-options.labels',
    'changelog:test-options.template-simple',
    'changelog:test-options.template-labeled',
    'changelog:test-options.template-grouped',
    'changelog:test-options.template-path',
    'changelog:test-options.template.file',
    'changelog:test-options.template.data-object',
    'changelog:test-options.template.data-function',
    'changelog:test-options.matchers-regexp',
    'changelog:test-options.matchers-function',

    'git-restore',
    'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

  // stub git for testing grunt flow
  grunt.registerTask('git-stub', 'stub git', function() {
    sinon.stub(git, 'branch', function(done) {
      done(null, 'specific-branch');
    });

    sinon.stub(git, 'last_tag', function(done) {
      done(null, '0.0.0');
    });

    sinon.stub(git, 'log', function(fixture) {
      return {
        stdout: fs.createReadStream(path.resolve(__dirname, 'test/fixtures/git/log'))
      };
    });
  });

  grunt.registerTask('git-restore', 'restore git', function() {
    sinon.restore();
  });
};
