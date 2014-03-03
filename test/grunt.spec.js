
var fs   = require('fs');
var path = require('path');

// based on `grunt changelog` generated results
describe('Grunt task', function() {

  function exists(file) {
    return fs.existsSync(path.resolve(__dirname, '../tmp/', file));
  }

  function generated(file) {
    return fs.readFileSync(path.resolve(__dirname, '../tmp/', file))
      .toString();
  }

  function expected(file) {
   return fs.readFileSync(path.resolve(__dirname, './expected/grunt/', file))
      .toString();
  }

  it('should write to `options.changelog`', function() {

    expect(generated('options.changelog'))
      .to.eq(expected('options.changelog'));
  });

  it('should use `options.version`', function() {

    expect(generated('options.version'))
      .to.eq(expected('options.version'));
  });

  it('prepend generated content', function() {

    expect(generated('options.changelog-prepend'))
      .to.eq(expected('options.changelog-prepend'));
  });

  it('should not write to changelog when `options.write` is `false`', function() {

    expect(exists('nowrite'))
      .to.be.false;
  });

  it('should proceed if current branch is `options.branch`', function() {

    expect(generated('options.branch'))
      .to.eq(expected('options.branch'));
  });

  it('should collect all commits by default', function() {

    expect(generated('options.labels-all'))
      .to.eq(expected('options.labels-all'));
  });

  it('should collect only labeled commits if `options.labels` defined', function() {

    expect(generated('options.labels'))
      .to.eq(expected('options.labels'));
  });

  it('should use predefined `options.template = "simple"`', function() {

    expect(generated('options.template-simple'))
      .to.eq(expected('options.template-simple'));
  });

  it('should use predefined `options.template = "labeled"`', function() {

    expect(generated('options.template-labeled'))
      .to.eq(expected('options.template-labeled'));
  });

  it('should use predefined `options.template = "grouped"`', function() {

    expect(generated('options.template-grouped'))
      .to.eq(expected('options.template-grouped'));
  });

  it('should use `options.template = "path/to/template"`', function() {

    expect(generated('options.template-path'))
      .to.eq(expected('options.template-path'));
  });

  it('should use predefined `options.template.file = "path/to/template"`', function() {

    expect(generated('options.template.file'))
      .to.eq(expected('options.template.file'));
  });

  it('should use `options.template.data = {}`', function() {

      expect(generated('options.template.data-object'))
        .to.eq(expected('options.template.data-object'));
  });

  it('should use `options.template.data = function(data) { return data; }`', function() {

      expect(generated('options.template.data-function'))
        .to.eq(expected('options.template.data-function'));
  });
});