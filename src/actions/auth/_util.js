'use strict';

const {pipe, get: get, either} = require('sanctuary-env'); //eslint-disable-line
const {chain, ifElse, test, split, nth, trim, always} = require('ramda');
const error = require('http-errors');
const Future = require('fluture');
const {maybeToFuture} = require('../../util/future');

//getTokenFromHeaders :: Headers -> Future Error Object
exports.getTokenFromHeaders = pipe([
  get(String, 'authorization'),
  maybeToFuture(error(403, 'Missing Authorization header')),
  chain(ifElse(
    test(/^ *Bearer:/),
    pipe([split(':'), nth(1), trim, Future.of]),
    always(Future.reject(error(403, 'Authorization method must be Bearer')))
  ))
]);
