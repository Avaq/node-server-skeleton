'use strict';

const jwt = require('jwt-simple');
const {
  ftap,
  map,
  K,
  get,
  pipe,
  encase,
  maybeToEither,
  curry2,
  chain,
  filter,
  equals,
  is
} = require('../prelude');

//    ALGORITHM :: Algorithm
const ALGORITHM = 'HS256';

//    VERSION :: Number
const VERSION = 1;

//    safeEncode :: (Object, String, Algorithm) -> Either Error String
const safeEncode = (a, b, c) => encase(_ => jwt.encode(a, b, c))(0);

//    safeDecode :: (String, String, Boolean, Algorithm) -> Either Error Object
const safeDecode = (a, b, c, d) => encase(_ => jwt.decode(a, b, c, d))(0);

//      getAlgorithm :: a -> Algorithm
exports.getAlgorithm = K(ALGORITHM);

//      getVersion :: a -> Number
exports.getVersion = K(VERSION);

//      encodeToken :: String -> Object -> Either Error String
exports.encodeToken = curry2((secret, payload) => safeEncode(payload, secret, ALGORITHM));

//      decodeToken :: String -> String -> Either Error Object
exports.decodeToken = curry2((secret, token) => safeDecode(token, secret, false, ALGORITHM));

//      encode :: String -> Object -> Either Error String
exports.encode = curry2((secret, data) => pipe([
  d => ({d, v: VERSION}),
  exports.encodeToken(secret),
  maybeToEither(new Error('Failed to encode token'))
])(data));

//      decode :: String -> String -> Either Error Object
exports.decode = curry2((secret, token) => pipe([
  exports.decodeToken(secret),
  chain(ftap(map(filter(equals(VERSION)), get(is(Number), 'v')))),
  chain(get(is(Object), 'd')),
  maybeToEither(new Error('Token was invalid or had an invalid format or version number'))
])(token));
