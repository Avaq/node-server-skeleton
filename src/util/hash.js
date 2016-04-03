'use strict';

import md5 from 'crypto-md5';
import crypto from 'crypto';
import {decode} from './common';
import {slice, pipe} from 'ramda';
import {node} from 'fluture';

/**
 * Hashes a string to an integer.
 *
 * @sig strToInt :: String -> Number
 *
 * @param {String} str The string to hash.
 *
 * @return {Number} An integer.
 */
export const strToInt = str => {

  if(str.length === 0){
    return 0;
  }

  let hash = 0;

  for(let i = 0; i < str.length; i++){
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
export const hexmd5 = str => md5(str, 'hex');

/**
 * Hash an object to hexmd5.
 *
 * @param {Object} obj Object to hash.
 *
 * @return {String} MD5 Hash.
 */
export const objectToString = pipe(JSON.stringify, hexmd5);

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
export const randomString = size => (
  node(done => crypto.randomBytes(Math.ceil(size / 2), done))
  .map(decode('hex'))
  .map(slice(0, size))
);
