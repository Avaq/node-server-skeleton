'use strict';

const def = require('../util/typedef');
const tcomb = require('tcomb');
const {union} = require('tcomb');
const {Readable} = require('stream');
const {test} = require('sanctuary-env');
const {complement: not} = require('ramda');

//Extend tcomb default types.
const T = Object.create(tcomb);
module.exports = T;

//between :: Number, Number -> Number -> Boolean
const between = (a, b) => x => x >= a && x <= b;

//is :: Function -> Any -> Boolean
const is = cons => x => x instanceof cons;

T.ResponseStatus = def('ResponseStatus', T.Integer, {
  'must be a value betwen 100 and 599': not(between(100, 599))
});

T.ResponseHeader = def('ResponseHeader', T.String, {
  'may only contain alphanumeric characters and dashes': test(/[^a-zA-Z0-9-]/)
});

T.ReadableStream = def('ReadableStream', T.Any, {
  'is not an instance of ReadableStream': not(is(Readable))
});

T.ResponseBody = union([
  T.String, T.ReadableStream
], 'ResponseBody');

T.Username = def('Username', T.String, {
  'must be between 3 and 32 characters long': x => not(between(3, 32))(x.length),
  'should contain only lowercase characters, numbers and underscores': test(/[^a-z0-9_]/),
  'should not start with an underscore': test(/^_/),
  'should not end with an underscore': test(/_$/),
  'should not contain double underscores': test(/_{2}/)
});

T.Password = def('Password', T.String, {
  'must be between 8 and 64 characters long': x => not(between(8, 64))(x.length)
});

T.Group = def('Group', T.String, {});
