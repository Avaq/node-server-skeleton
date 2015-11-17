'use strict';

import md5 from 'crypto-md5';
import {pipe} from 'ramda';

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
