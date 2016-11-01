'use strict';

const def = require('../util/typedef');
const tcomb = require('tcomb');
const {union} = require('tcomb');
const {Readable} = require('stream');
const {test} = require('sanctuary');
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
