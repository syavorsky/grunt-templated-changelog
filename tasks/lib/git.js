
var _        = require('lodash');
var util     = require('util');
var spawn    = require('child_process').spawn;
var execFile = require('child_process').execFile;


module.exports.branch = function branch(done) {

  execFile('git', ['rev-parse', '--abbrev-ref', 'HEAD'], function(err, stdout) {
    return done(err, stdout.trim());
  });
};

// @TODO check if no tags
module.exports.last_tag = function last_tag(done) {

  execFile('git', ['describe', '--abbrev=0', '--tags'], function(err, tag) {

    if (err) {
      execFile('git', ['log', '--reverse', '--format=%h'], function(err, hashs) {
        done(err, hashs.split('\n')[0].trim());
      });

    } else {
      done(err, tag.trim());
    }
  });
};

module.exports.log = (function() {

  var defaults = {
    from : 'HEAD',
    to   : 'HEAD'
  };

  var placeholders = {
    hash         : 'H',
    hash_abbr    : 'h',
    author_name  : 'aN',
    author_email : 'aE',
    date         : 'ai',
    subject      : 's',
    body         : 'B'
  };

  var format = _.reduce(placeholders, function(format, placeholder, field) {
    return format + util.format('<@@%s@@%%%s@@>', field, placeholder);
  }, '');

  format = util.format('<@@@%s@@@>', format);

  return function log(options) {

    options = _.defaults(options || {}, defaults);

    return spawn('git', ['log', options.from + '..' + options.to, '--format=' + format]);
  };

}());
