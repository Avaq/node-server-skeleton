'use strict';

const jwt = require('jwt-simple');
const {
  ftap,
  map,
  get,
  pipe,
  encase,
  maybeToEither,
  chain,
  filter,
  equals,
  is
} = require('../prelude');

//    ALGORITHM :: Algorithm
const ALGORITHM = 'HS256';

//    VERSION :: Number
const VERSION = 1;

//    encodeFailure :: Error
const encodeFailure = new Error('Failed to encode token');

//    invalidToken :: Error
const invalidToken = new Error('Token was invalid or had an invalid format or version number');

//    safeEncode :: (Object, String, Algorithm) -> Either Error String
const safeEncode = (a, b, c) => encase(_ => jwt.encode(a, b, c))(0);

//    safeDecode :: (String, String, Boolean, Algorithm) -> Either Error Object
const safeDecode = (a, b, c, d) => encase(_ => jwt.decode(a, b, c, d))(0);

//     default :: String -> TokenService
module.exports = secret => {
  const encodeToken = payload => safeEncode(payload, secret, ALGORITHM);
  const decodeToken = token => safeDecode(token, secret, false, ALGORITHM);
  const encode = pipe([d => ({d, v: VERSION}), encodeToken, maybeToEither(encodeFailure)]);
  const decode = pipe([
    decodeToken,
    chain(ftap(map(filter(equals(VERSION)), get(is(Number), 'v')))),
    chain(get(is(Object), 'd')),
    maybeToEither(invalidToken)
  ]);
  return {ALGORITHM, VERSION, encodeToken, decodeToken, encode, decode};
};
