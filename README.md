# grunt-templated-changelog

> Generates customized changelog file from git logs.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-templated-changelog --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-templated-changelog');
```

## The "changelog" task

### Overview

This plugin is inspired by [conventional-changelog](https://github.com/ajoslin/conventional-changelog) the goal was to allow custom commit conventions and output formatting. 

The bare minimum needed to get task running is to define options as following

```
chagelog: {
  release: {
    options: {
      version: '0.1.0'
    }
  }}
```

which would prepend generated changelog to your `CHANGES.md` by default

```
# 0.1.0

- Fixing Something somehow `021e25c`
- Another fix `fade3f6`
- Added tweaks and tricks `2ead19e`
- Another commit `6048f34`
- multiline comment `dddc845`
- One line comment with no label `bf4394b`
```

Task grabs Git log records since the most recent tag or first commit if no tags were made yet. Format and content can be heavily customized by passing different options.

### Usage Examples

Simple use not requirung any commit format conventions

```
chagelog: {
  release: {
    options: {
      version: '0.1.0'
    }
  }}
```

Compact changelog including only maeningfull commits. Assuming you add `label(target)` marker at the beginning of commit message and separate subject from commit body with empty line

```
chagelog: {
  release: {
    options: {
      version: '0.1.0',
      labels: ['feature', 'bugfix'],
      template: 'labeled'
    }
  }}
```

If you have many people using your code and want to expose maximum of information try this

```
chagelog: {
  release: {
    options: {
      version: '0.1.0',
      labels: ['feature', 'bugfix'],
      template: 'grouped'
    }
  }}
```

And you always can use your own format convention and handle it with custom `options.matchers` and `optoins.template`.


### Options

#### options.version
Type: `String`
Default value: `next`

A string value defining the version headline

#### options.changelog
Type: `String`
Default value: `CHANGES.md`

Path to the changelog file

#### options.write
Type: `Boolean`
Default value: `true`

Tells either generated log should be written to the file. You may set it to `false` or run the task with `--no-write` to preview the content.

#### options.branch
Type: `String`
Default value: `null`

Requires the task to be ran in specific branch if needed.

#### options.labels
Type: `String[]`
Default value: `[]`

Tells the task to only grab commits with specific labels and list them in corresponding order. This helps to keep only meaningful information in the changelog. By default Commits are labeled by adding `label[target]` string at the beginning of the commit message. [conventional-changelog](https://github.com/ajoslin/conventional-changelog) makes a good suggestion on label names to be used

* `feat` A new feature
* `fix` A bug fix
* `docs` Documentation only changes
* `style` Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* `refactor` A code change that neither fixes a bug or adds a feature
* `test` Adding missing tests
* `chore` Changes to the build process or auxiliary tools and libraries such as documentation
  generation

This list is just illustratin approach, it's up to you how to label commits. 

`target` should point you to the component changes relates to.

Commit marker can be omited or customized with `options.matchers`

#### options.template
Type: `String|Object`
Default value: `simple`

There is few predefined templates you can refer by name `simple`, `labeled`, `grouped`. They are different by how much information they render. 

`simple` template

```
# next

- Fixing Something somehow `021e25c`
- Another fix `fade3f6`
- Added tweaks and tricks `2ead19e`
- Another commit `6048f34`
- multiline comment `dddc845`
- One line comment with no label `bf4394b`
```

`labeled` template

```
# next

- `bugfix` Fixing Something somehow `021e25c`
- `bugfix` Another fix `fade3f6`
- `feature` Added tweaks and tricks `2ead19e`
- `refactor` multiline comment `dddc845`
- `style` Another commit `6048f34`
- One line comment with no label `bf4394b`
```

`grouped` template

```
# next

## feature
### Something
- Added tweaks and tricks `2ead19e`

## bugfix
### Component
- Another fix `fade3f6`

### Something
- Fixing Something somehow `021e25c`

## style
### Component
- Another commit `6048f34`


## Breaking changes

- breaks the build
- causes headaches

Use `options.b` instead of `options.a`
```

Also you can use custom template by setting `options.template` to file path relative to `Gruntfile`.

In case you want to pass more data to the template or change existing you can do following:

```
template: {
  file: 'path/to/file',
  data: {
    var1: value,
    var2: value  }}
```

or

```
template: {
  file: 'path/to/file',
  data: function(data) {
    data.var1 = value;
    data.var2 = value;
    return data;  }}
```

#### options.matchers
Type: `String`
Default value: `{}`

Use this option if you need to grab bits of data from commit message. Lets say you have following in commits `@marker:value`. To make `commit.marker` available in templates you need

```
matchers: {
  marker: /@marker:(\w+)/}
```

first memorized group in RegExp is becoming a value. For more advannced logic you can use function values

```
matchers: {
  marker: function(body) {
	return body.match(/@marker:(\w+)/)[1];
  }}
```

There some some predefine matchers which you can override if needed: `subject`, `label`, `target`, `breaking_changes`.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
See `CHANGES.md`
