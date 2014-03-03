
var _        = require('lodash');
var fs       = require('fs');
var path     = require('path');
var util     = require('util');
var Writable = require('stream').Writable;


/* ------- Base Writer ------- */


function Writer(options) {

  this.options = _.defaults(options || {}, {
    template : '',
    data     : _.identity
  });

  Writable.call(this, {objectMode: true});

  this._commits = [];
}

util.inherits(Writer, Writable);

Writer.prototype._write = function write(commit, encoding, done) {
  this._commits.push(commit);
  done();
};

Writer.prototype.contents = function contents(done) {

  var options = this.options;
  var data    = {
    commits : this._commits
  };

  fs.exists(options.template, function(exists) {
    if (!exists) {
      return done(new Error(util.format('Template "%s" does not exist', options.template)));
    }

    fs.readFile(options.template, function(err, tpl) {
      if (err) { return done(err); }

      try {
        data = options.data(data);
      } catch (err) {
        err.message = 'Failed to apply `options.data`. ' + err.message;
        return done(err);
      }

      var content;

      try {
        content = _.template(tpl.toString(), data);
      } catch (err) {
        err.message = util.format('Failed to eval "%s". %s', options.template, err.message);
        return done(err);
      }

      done(null, content);
    });
  });
};


function sort_by(arr, field, order) {
  if (order && order.length) {
    return _.sortBy(arr, function(item) {
      var pos = order.indexOf(item[field]);
      return pos === -1 ? Infinity : pos;
    });

  } else {
    return _.sortBy(arr, function(item) {
      return item[field] || 'zzzzzzzzzzzzz';
    });
  }
}

function group_by(arr, field, order) {
  arr = _.chain(arr)
    .groupBy(field)
    .map(function(commits, group_field) {
      return _.zipObject([field, 'commits'], [group_field, commits]);
    })
    .value();

  return sort_by(arr, field, order);
}

/* ------- public API ------- */

module.exports = Writer;

module.exports.presets = {

  simple: {
    template : path.resolve(__dirname + '/writer/simple.tpl')
  },

  labeled: {
    template : path.resolve(__dirname + '/writer/labeled.tpl'),
    data     : function(data) {
      data.commits = data.commits.map(function(commit) {
        commit.label = commit.label || '';
        commit.target = commit.target || '';
        return commit;
      });

      data.commits = sort_by(data.commits, 'label', data.labels);

      return data;
    }
  },

  grouped: {
    template : path.resolve(__dirname + '/writer/grouped.tpl'),
    data     : function(data) {
      data.breaking_changes = data.commits.reduce(function(breaking_changes, commit) {
        if (commit.breaking_changes) { breaking_changes.push(commit.breaking_changes); }
        return breaking_changes;
      }, []);

      data.commits = data.commits.map(function(commit) {
        commit.label = commit.label || '';
        commit.target = commit.target || '';
        return commit;
      });

      data.commits = group_by(data.commits, 'label', data.labels)
        .map(function(group) {
          group.commits = group_by(group.commits, 'target');
          return group;
        });

      return data;
    }
  }
};
