
var fs     = require('fs');
var path   = require('path');
var stream = require('stream');

var git    = require('../tasks/lib/git');
var Parser = require('../tasks/lib/parser');


describe('lib/parser', function() {

  var writer, commits;

  beforeEach(function() {
    commits = [];

    writer  = new stream.Writable({objectMode: true});
    writer._write = function(commit, enc, done) {
      commits.push(commit);
      done();
    };

    sinon.stub(git, 'log', function(fixture) {
      return fs.createReadStream(path.resolve(__dirname, 'fixtures/git/' + fixture));
    });
  });

  it('should parse all commits', function(done) {

    git.log('log')
      .pipe(new Parser())
      .pipe(writer);

    writer.on('finish', function() {
      expect(commits.length)
        .to.eq(6);

      done();
    });
  });

  it('should collect only commits with specific labels', function(done) {

    git.log('log')
      .pipe(new Parser({
        labels: ['feature', 'bugfix']
      }))
      .pipe(writer);

    writer.on('finish', function() {
      expect(_.countBy(commits, 'label'))
        .to.eql({
          bugfix  : 2,
          feature : 1
        });

      done();
    });
  });

  it('should match standard fields', function(done) {

    var parser = new Parser();

    git.log('log.default')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          subject      : 'Another fix',
          body         : 'Another fix\n\nnext line'
        });

      done();
    });
  });

  it('should parse `label(target)` mark and strip it from subject', function(done) {

    var parser = new Parser();

    git.log('log.labeled')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          body         : 'bugfix(component) Another fix\n\nnext line',

          subject      : 'Another fix',
          label        : 'bugfix',
          target       : 'component'
        });

      done();
    });
  });

  it('should parse `label()` with no target', function(done) {

    var parser = new Parser();

    git.log('log.notarget')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          body         : 'bugfix() Another fix\n\nnext line',

          subject      : 'Another fix',
          label        : 'bugfix'
        });

      done();
    });
  });

  it('should parse `Issues #issue[, #issue[, #issue]]`', function(done) {

    var parser = new Parser();

    git.log('log.issues')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          subject      : 'Another fix',
          body         : 'Another fix\n\nnext line\n\nIssues #ISSUE-99, #ISSUE-98',
          issues       : ['ISSUE-99', 'ISSUE-98']
        });

      done();
    });
  });

  it('should use custom RegExp matchers', function(done) {

    var parser = new Parser({
      matchers : {
        closes : /@closes:([^\s]+)/
      }
    });

    git.log('log.custom')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          subject      : 'Another fix',
          body         : 'Another fix\n\nnext line\n\n@closes:ISSUE-99',
          closes       : 'ISSUE-99'
        });

      done();
    });
  });

  it('should use custom Function matchers', function(done) {

    var parser = new Parser({
      matchers : {
        closes : function(body) {
          return body.match(/@closes:([^\s]+)/)[1];
        }
      }
    });

    git.log('log.custom')
      .pipe(parser);

    parser.on('data', function(commit) {

      expect(commit)
        .to.eql({
          hash         : 'fade3f6d3532d5b915226d59d68884b7e602991f',
          hash_abbr    : 'fade3f6',
          author_name  : 'John Doe',
          author_email : 'john.doe@domain.com',
          date         : '2014-02-24 11:43:58 -0800',
          subject      : 'Another fix',
          body         : 'Another fix\n\nnext line\n\n@closes:ISSUE-99',
          closes       : 'ISSUE-99'
        });

      done();
    });
  });
});
