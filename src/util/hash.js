'use strict';

const crypto = require('crypto');
const {decode} = require('./common');
const {slice, pipe} = require('ramda');
const {node} = require('fluture');
const {createHash} = require('crypto');

/**
 * Hashes a string to an integer.
 *
 * @sig strToInt :: String -> Number
 *
 * @param {String} str The string to hash.
 *
 * @return {Number} An integer.
 */
exports.strToInt = str => {

  if(str.length === 0) {
    return 0;
  }

  let hash = 0;

  for(let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;

};

/**
 * Hash a string to hexidecimal MD5.
 *
 * @param {String} str The value to hash.
 *
 * @return {String} 32 Hexidecimal numbers.
 */
const hexmd5 = exports.hexmd5 = x => createHash('md5').update(x).digest().toString('hex');

/**
 * Hash an object to hexmd5.
 *
 * @param {Object} obj Object to hash.
 *
 * @return {String} MD5 Hash.
 */
exports.objectToString = pipe(JSON.stringify, hexmd5);

/**
 * Get a random string of the given amount of characters.
 *
 * Currently the string is hexidecimal, so it contains an amount of bytes of
 * entropy equal to half the amount of characters. This may change in the future
 * but could be something to keep in mind.
 *
 * @sig randomString :: Integer -> Future[Error, String]
 *
 * @param {Number} size The amount of characters the string should have.
 *
 * @return {Future} A Future of the random string.
 */
exports.randomString = size => (
  node(done => crypto.randomBytes(Math.ceil(size / 2), done))
  .map(decode('hex'))
  .map(slice(0, size))
);
