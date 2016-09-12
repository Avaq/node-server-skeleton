'use strict';

const Future = require('fluture');
const {either, maybe, Left, Right} = require('sanctuary-env');
const {curry} = require('ramda');

//    maybeToFuture :: Maybe b -> a -> Future a b
exports.maybeToFuture = curry((e, m) => maybe(Future.reject(e), Future.of, m));

//    eitherToFuture :: Either a b -> Future a b
exports.eitherToFuture = either(Future.reject, Future.of);

//    attempt :: Future a b -> Future x (Either a b)
exports.attempt = Future.fold(Left, Right);
