'use strict';

import util from 'util';
import {
  curry, tap, compose, invoker, map, converge, lens, unary, path, assocPath,
  ifElse, contains, unapply, last, append, add, __, head, groupBy, prop,
  fromPairs, filter, apply, flip, toPairs, constructN, nAry, always, toString
} from 'ramda';

/**
 * Takes an error and returns the most complete message it can extract from it.
 *
 * @sig getErrorString :: Error -> String
 *
 * @param {Error} err The error to inspect.
 *
 * @return {String} The error message.
 */
export const getErrorString = err => (err && (err.stack || err.message)) || toString(err);

/**
 * Curried version of util.inspect.
 *
 * @sig inspect :: Object -> a -> String
 *
 * @param {Object} options Options for util.inspect.
 * @param {Object} a The object to inspect
 *
 * @return {String} The string representation of `a`.
 */
export const inspect = curry((opt, a) => util.inspect(a, opt));

/**
 * Write an object to standard output after converting it to JSON with a dual-space indentation.
 *
 * @sig dump :: a -> a
 *
 * @param {Object} The object to write.
 *
 * @return {Object} The input.
 */
export const dump = tap(compose(util.log, add(__, '\n'), a => JSON.stringify(a, null, 2)));

/**
 * Decode a buffer to string.
 *
 * @sig decode :: String -> Buffer -> String
 *
 * @param {String} encoding The character encoding to use.
 * @param {Buffer} buffer The buffer to decode.
 *
 * @return {String} The decoded buffer.
 */
export const decode = invoker(1, 'toString');

/**
 * Create a lens for a deep property.
 *
 * @sig lensPath :: [String] -> Lens s a
 *
 * @param {Array} path The path to take to the property.
 *
 * @return {Lens} A lens which focusses on the property at the given path.
 */
export const lensPath = converge(lens, [unary(path), unary(assocPath)]);

/**
 * Append a value to a list if it's not in the list yet.
 *
 * @sig appendUniq :: a -> [a] -> [a]
 *
 * @return {Array}
 */
export const appendUniq = ifElse(contains, unapply(last), append);

/**
 * Index an object by a property name.
 *
 * Given a property name to index-by and a list of objects, each guaranteed to
 * have the indexing property set, returns an object indexing the objects by
 * their keys.
 *
 * @sig indexBy :: String -> [Object] -> Object
 *
 * @param {String} key The key to index by.
 * @param {Array} list The list of objects to create an index for.
 *
 * @type {Object} The index.
 */
export const indexBy = curry((k, l) => map(head, groupBy(prop(k), l)));

/**
 * Filter over an objects properties.
 *
 * Applies the given function to each of the objects key/value pairs and return
 * a new object with the properties omitted for which the function returned false.
 *
 * @sig (v, k -> Boolean) -> {k: v} -> {k: v}
 *
 * @param {Function} f The filterer.
 * @param {Object} o The object to filter.
 *
 * @return {Object} The filtered object.
 */
export const filterObject = curry((f, o) => fromPairs(filter(apply(flip(f)), toPairs(o))));

/**
 * Return the current date.
 *
 * @sig now :: * -> Date
 *
 * @return {Date} A Date object representing the time this function was called.
 */
export const now = constructN(0, Date);

/**
 * Create a Date from a String.
 *
 * @sig date :: String -> Date
 *
 * @param {String} constructor The String to pass to JavaScript's Date constructor.
 *
 * @return {Date} The created Date.
 */
export const date = constructN(1, Date);

/**
 * Makes a function ignore all arguments.
 *
 * (*... -> a) -> Void -> a
 *
 * @return {Function}
 */
export const nullary = nAry(0);

/**
 * Allows for creating one-line strings over multiple lines with template strings.
 *
 * Behaves like how HTML treats strings over multiple lines. Newlines are turned
 * into spaces, multiple concurrent spaces are treated as one.
 *
 * @return {String} The final concatenated string.
 */
export const line = (strings, ...values) => strings
  .map((v, i) => v.replace(/[\n\s\r ]+/g, ' ') + (values[i] || ''))
  .join('')
  .trim(' \n');

/**
 * Wrap a function which returns a Functor to resolve with its argument.
 *
 * @sig ftap :: (a -> Functor[*]) -> a -> Functor[a]
 *
 * @param {Function} f The function to wrap.
 *
 * @return {Function} A function which when called returns a Functor of its argument.
 */
export const ftap = f => a => f(a).map(always(a));
