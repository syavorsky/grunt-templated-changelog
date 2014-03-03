
var fs     = require('fs');
var path   = require('path');
var stream = require('stream');

var Writer = require('../tasks/lib/writer');


describe('lib/writer', function() {

    var commits, parser;

    before(function(done) {

        fs.readFile(path.resolve(__dirname, 'fixtures/writer/commits.json'), function(err, content) {
            if (err) { return done(err); }
            commits = JSON.parse(content);
            done();
        });
    });

    beforeEach(function() {
        var data = commits.slice();

        parser = new stream.Readable({objectMode: true});
        parser._read = function() {
            this.push(data.shift() || null);
        };
    });

    it('should render the template with commits data', function(done) {
        var writer = new Writer({
            template: path.resolve(__dirname + '/fixtures/writer/default.tpl')
        });

        parser
            .pipe(writer)
            .on('finish', function() {

                this.contents(function(err, contents) {

                    if (err) { return done(err); }

                    expect(contents)
                        .to.eq('contains 5 commits');

                    done();
                });
            });
    });

    it('should apply options.data to the template vars', function(done) {
        var writer = new Writer({
            template: path.resolve(__dirname + '/fixtures/writer/data.tpl'),
            data: function(data) {
                data.commits = data.commits.slice(0, 3);
                data.things  = [1,2,3];
                return data;
            }
        });

        parser
            .pipe(writer)
            .on('finish', function() {

                this.contents(function(err, contents) {

                    if (err) { return done(err); }

                    expect(contents)
                        .to.eq('contains 3 commits\ncontains 3 things');

                    done();
                });
            });
    });

    it('should fail if template does not exist', function(done) {
        var writer = new Writer({
            template: 'invalid'
        });

        writer.contents(function(err, contents) {

            expect(err)
                .to.be.instanceof(Error);

            expect(err.message)
                .to.eq('Template "invalid" does not exist');

            done();
        });
    });
});