'use strict';

const jwt = require('jwt-simple');
const {ftap} = require('../util/common');
const {B, I, K, get, pipe, encase, maybeToEither} = require('sanctuary-env');
const {curry, chain, applySpec, filter, equals} = require('ramda');

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
exports.encodeToken = curry((secret, payload) => safeEncode(payload, secret, ALGORITHM));

//      decodeToken :: String -> String -> Either Error Object
exports.decodeToken = curry((secret, token) => safeDecode(token, secret, false, ALGORITHM));

//      encode :: String -> Object -> Either Error String
exports.encode = curry((secret, data) => pipe([
  applySpec({v: exports.getVersion, d: I}),
  exports.encodeToken(secret),
  maybeToEither(new Error('Failed to encode token'))
])(data));

//      decode :: String -> Object -> Either Error Object
exports.decode = curry((secret, token) => pipe([
  exports.decodeToken(secret),
  chain(ftap(B(filter(equals(VERSION)), get(Number, 'v')))),
  chain(get(Object, 'd')),
  maybeToEither(new Error('Token was invalid or had an invalid format or version number'))
])(token));
