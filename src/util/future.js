'use strict';

import {Future} from 'ramda-fantasy';
import {curry} from 'ramda';

/**
 * Make a node-style async function return a Future.
 *
 * Takes a function which uses a node-style callback for continuation and
 * returns a function which returns a Future for continuation.
 *
 * @sig taskifyNode :: (*,(a,b -> Void) -> Void) -> (* -> Future(a,b))
 *
 * @param {Function} f The node function to wrap.
 *
 * @return {Function} A function which returns a Future.
 */
export const taskifyNode = f => (...arg) => new Future(
  (rej, res) => f(...arg, (err, result) => err ? rej(err) : res(result))
);

/**
 * Make a synchronous function which might throw return a Future.
 *
 * @sig taskifyTry :: (* -> @a|b) -> (* -> Future(a,b))
 *
 * @param {Function} f The function to wrap.
 *
 * @return {Function} A function which returns a Future.
 */
export const taskifyTry = f => (...arg) => new Future((rej, res) => res(f(...arg)));

/**
 * Convert a Maybe to a Future.
 *
 * @sig maybeToFuture :: a -> Maybe b -> Future(a, b)
 *
 * @param {Error} err The value for the error branch, in case the Maybe is a Nothing.
 *
 * @return {Future} A task which resolves with the value of the Just, or your error.
 */
export const maybeToFuture = curry((err, maybe) => new Future((rej, res) => {
  maybe.toBoolean() ? maybe.map(res) : rej(err);
}));

