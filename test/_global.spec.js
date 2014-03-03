
var _sinon = require('sinon');

global._      = require('lodash');
global.expect = require('chai').expect;

beforeEach(function() {
    global.sinon = _sinon.sandbox.create();
});

afterEach(function() {
    global.sinon.restore();
});