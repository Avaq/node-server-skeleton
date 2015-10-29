'use strict';

import fs from 'fs';
import util from 'util';
import {taskifyNode} from './future';
import {
  curry, mapObjIndexed, tap, compose, invoker, map, converge, lens, unary, path,
  assocPath, ifElse, contains, unapply, last, append, add, __
} from 'ramda';

/**
 * Create an object based on a specification mapped over a value.
 *
 * @sig createObject :: {k: a -> b} -> a -> {k: b}
 *
 * @param {Object} spec The specification object. A hash of keys to functions.
 * @param {Object} val Any value, is passed to every function in the spec.
 *
 * @return {Object} An object with keys equal to the spec keys, and values equal
 *                  to the result of applying the spec values to the val.
 *
 * @example
 *
 *   const rowToUser = createObject({
 *     email: prop(0),
 *     name: prop(1),
 *     fullName: converge(unapply(join(' ')), [prop(1), prop(2)])
 *   });
 *
 *   rowToUser(['me@example.com', 'Aldwin', 'Vlasblom']);
 *   //-> {email: 'me@example.com', name: 'Aldwin', fullName: 'Aldwin Vlasblom'}
 *
 */
export const createObject = curry((spec, val) => mapObjIndexed(f => f(val), spec));

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
 * Write a string to standard output.
 *
 * @sig sysout :: String -> Boolean
 *
 * @param {String} str String to write.
 *
 * @return {Boolean} Whether the operation was successful.
 */
export const sysout = process.stdout.write.bind(process.stdout);

/**
 * Write a string to standard error.
 *
 * @sig sysout :: String -> Boolean
 *
 * @param {String} str String to write.
 *
 * @return {Boolean} Whether the operation was successful.
 */
export const syserr = process.stderr.write.bind(process.stderr);

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
 * Write an object to standard output after converting it to string with inspect.
 *
 * @sig log :: a -> a
 *
 * @param {Object} The object to write.
 *
 * @return {Object} The input.
 */
export const log = tap(compose(sysout, add(__, '\n'), inspect({})));

/**
 * Write an object to standard output after converting it to JSON.
 *
 * @sig log :: a -> a
 *
 * @param {Object} The object to write.
 *
 * @return {Object} The input.
 */
export const dump = tap(compose(sysout, add(__, '\n'), JSON.stringify));

/**
 * Write an error to standard error after converting it to string.
 *
 * @sig log :: Error -> Error
 *
 * @param {Error} The error to write.
 *
 * @return {Error} The input.
 */
export const warn = tap(compose(syserr, add(__, '\n'), getErrorString));

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
 * Get the contents of a file on the filesystem.
 *
 * @sig readFile :: String -> Future(Error, String)
 *
 * @param {String} path The path to the location of the file.
 *
 * @return {Future} A Future of an error, or the file contents.
 */
export const readFile = compose(map(decode('utf-8')), taskifyNode(fs.readFile));

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
