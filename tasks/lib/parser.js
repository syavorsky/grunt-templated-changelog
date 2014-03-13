
var _         = require('lodash');
var util      = require('util');
var Transform = require('stream').Transform;


function Parser(options) {

  options = options || {};

  Transform.call(this, {objectMode: true});

  this._data = '';

  this._matchers = _.extend({

    // subject with "label(target)" stripped
    subject : /^[^\(]+\([^\)]*\)\s+(.*)(?:\n\n|$)/,

    // label, assuming line starts with "label(target)"
    label   : /^([^\(]+)\([^\)]*\)\s+/,

    // target, assuming line starts with "label(target)"
    target  : /^[^\(]+\(([^\)]*)\)\s+/,

    // breaking changes
    breaking_changes: /BREAKING CHANGES:\s+([^$]+)/,

    // issues, assumig format is "Issues #issue[, #issue[, #issue]]"
    issues  : function parse_issues(body) {
      var issues  = null;
      var content = body.match(/\s+(?:issues|closes)(?:,?\s#([^,\n]+))+/i);

      if (content) {
        issues = content[0].match(/#([^,\n\s]+)/g).map(function(issue) {
          return issue.slice(1);
        });
      }

      return issues;
    }
  }, options.matchers || {});


  // convert all matchers into functions
  this._matchers = _.reduce(this._matchers, function(matchers, matcher, field) {
    if (_.isFunction(matcher)) {
      matchers[field] = matcher;
      return matchers;
    }

    if (_.isRegExp(matcher)) {
      matchers[field] = function match_re(body) {
        var matchs = body.match(matcher);
        return matchs ? matchs[1] : null;
      };
      return matchers;
    }

    throw new Error(util.format('Invalid matcher "%s"', matcher));
  }, {});

  this._labels = options.labels || [];
}

util.inherits(Parser, Transform);


Parser.prototype._transform = function transform(data, encoding, done) {

  this._data += data.toString();

  var commit, commit_start, commit_end;

  var marker_start = '<@@@';
  var marker_end   = '@@@>';

  while (true) {

    commit_start = this._data.indexOf(marker_start);
    commit_end   = this._data.indexOf(marker_end);

    if (commit_start === -1 || commit_end === -1) { break; }

    commit     = this._data.slice(commit_start + marker_start.length, commit_end);
    this._data = this._data.slice(commit_end + marker_end.length);

    commit = this._parse_commit(commit);

    if (commit) { this.push(commit); }
  }

  done();
};

Parser.prototype._parse_commit = function on_commit(commit) {

  commit = commit
    .replace(/^<@@|@@>$/g, '')
    .split('@@><@@')
    .reduce(function(commit, field) {
      var pieces = field.split('@@');
      commit[pieces[0]] = pieces[1].trim();
      return commit;
    }, {});

  commit = _.reduce(this._matchers, function(commit, matcher, field) {
    var matched = matcher(commit.body);
    if (matched) { commit[field] = matched; }
    return commit;
  }, commit);

  // filter on labels
  if (this._labels.length && this._labels.indexOf(commit.label) === -1) { return null; }

  return commit;
};


module.exports = Parser;





