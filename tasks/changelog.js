/*
 * grunt-templated-changelog
 *
 *
 * Copyright (c) 2014 Sergii Iavorskyi
 * Licensed under the MIT license.
 */

'use strict';

var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var git    = require('./lib/git');
var Parser = require('./lib/parser');
var Writer = require('./lib/writer');

module.exports = function(grunt) {

  grunt.registerMultiTask('changelog',
    'Generates customized changelog file from git logs.', function changelog() {

    var done    = this.async();
    var options = this.options({
      labels    : [],
      changelog : 'CHANGES.md',
      version   : 'next',
      template  : 'simple',
      matchers  : {},
      write     : !grunt.option('no-write')
    });

    var parser = new Parser({
      matchers : options.matchers,
      labels   : options.labels
    });

    options.template = options.template || {
      file : 'CHANGES.tpl',
      data : _.identity
    };

    var writer_options;

    if (Writer.presets[options.template]) {
      writer_options = _.clone(Writer.presets[options.template]);

    } else if (_.isString(options.template)) {
      writer_options = {
        template : path.resolve(process.cwd(), options.template),
        data     : {}
      };

    } else if (_.isObject(options.template)) {
      writer_options = {
        template : path.resolve(process.cwd(), options.template.file),
        data     : options.template.data || {}
      };
    }

    // inject common data to the template
    writer_options.data = (function(user_data) {

      return function data(template_data) {

        template_data = _.extend({}, template_data, {
          _       : _,
          grunt   : grunt,
          labels  : options.labels,
          version : options.version,
          date    : grunt.template.today('dd.mm.yyyy')
        });

        return _.defaults(template_data, _.isFunction(user_data) ? user_data(template_data) : user_data);
      };

    }(writer_options.data || {}));

    var writer = new Writer(writer_options);

    /* ------- runt the task ------- */

    git.branch(function(err, name) {

      if (err) { return done(err); }

      if (options.branch && name !== options.branch) {
        return grunt.warn('This task should be ran in `' + options.branch + '` branch, you are in `' + name + '` now.');
      }

      parser
        .on('data', function(commit) {
          grunt.verbose.writeln('Commit: '.yellow + JSON.stringify(commit, null, ' '));
        });

      git.last_tag(function(err, tag) {

        if (err) {
          return grunt.warn('Failed to retrieve last tag');
        }

        git.log({from: tag})
          .stdout
          .pipe(parser)
          .pipe(writer)
          .on('finish', function() {

            this.contents(function(err, contents) {

              if (err) { return done(err); }

              if (!options.write) {
                grunt.log.ok('Dry run. '.yellow + 'Following would be prepended to the ' + options.changelog);
                grunt.log.writeln(contents);

              } else {
                grunt.log.ok('Writing to ' + options.changelog);

                grunt.log.writeln(contents);

                var file_contents = grunt.file.exists(options.changelog) ? grunt.file.read(options.changelog) : '';
                grunt.file.write(options.changelog, contents + file_contents);
              }

              done();
            });
          });
      });
    });
  });
};
