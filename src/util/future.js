'use strict';

import {Future} from 'ramda-fantasy';
import {either} from 'sanctuary';
import {curry} from 'ramda';

/**
 * Make a node-style async function return a Future.
 *
 * Takes a function which uses a node-style callback for continuation and
 * returns a function which returns a Future for continuation.
 *
 * @sig wrapNode :: (x..., (a, b -> Void) -> Void) -> x... -> Future[a, b]
 *
 * @param {Function} f The node function to wrap.
 *
 * @return {Function} A function which returns a Future.
 */
export const wrapNode = f => (...arg) => Future(
  (rej, res) => f(...arg, (err, result) => err ? rej(err) : res(result))
);

/**
 * Make a synchronous function which might throw return a Future.
 *
 * @sig wrapTry :: (x... -> a) -> x... -> Future[Error, a]
 *
 * @param {Function} f The function to wrap.
 *
 * @return {Function} A function which returns a Future.
 */
export const wrapTry = f => (...arg) => Future((rej, res) => res(f(...arg)));

/**
 * Wraps a function which returns a Promise to return a Future instead.
 *
 * @sig wrapPromise :: (x... -> Promise[a, b]) -> x... -> Future[a, b]
 *
 * @param {Function} f A function which must return a Promise.
 *
 * @return {Function} A function which returns a Future of f.
 */
export const wrapPromise = f => (...arg) => Future((rej, res) => f(...arg).then(res, rej));

/**
 * Allow one-off wrapping of a function that requires node-style callback.
 *
 * @sig fromNode :: ((err, a) -> Void) -> Future[Error, a]
 *
 * @param {Function} f The operation expected to eventaully call the callback.
 *
 * @return {[type]} [description]
 */
export const fromNode = f => Future((rej, res) => f((err, a) => err ? rej(err) : res(a)));

/**
 * Convert a Maybe to a Future.
 *
 * @sig maybeToFuture :: a -> Maybe b -> Future[a, b]
 *
 * @param {Error} err The value for the error branch, in case the Maybe is a Nothing.
 * @param {Maybe} maybe The Maybe monad to convert.
 *
 * @return {Future} A task which resolves with the value of the Just, or your error.
 */
export const maybeToFuture = curry((err, m) => Future((rej, res) => {
  m.toBoolean() ? m.map(res) : rej(err);
}));

/**
 * Convert an Either to a Future.
 *
 * If the Either is a Left, the Future will reject with its value. If the Either
 * is a Right, the Future will resolve with the value.
 *
 * @param {Either} either The Either monad to convert.
 *
 * @return {Future} The Future.
 */
export const eitherToFuture = curry(m => Future((rej, res) => either(rej, res, m)));

/**
 * Create a Future which waits n milliseconds before resolving with a.
 *
 * @sig after :: Number -> a -> Future[*, a]
 *
 * @param {Number} n Amount of milliseconds to wait.
 * @param {Object} a Value to resolve with.
 *
 * @return {Future} The created Future.
 */
export const after = curry((n, a) => Future((rej, res) => setTimeout(res, n, a)));
