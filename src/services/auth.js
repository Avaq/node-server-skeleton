'use strict';

const {eitherToFuture} = require('../util/future');
const {randomString} = require('../util/hash');
const Future = require('fluture');
const {curry, difference, isEmpty, chain, map} = require('ramda');
const {Left, Right, pipe, get, maybeToEither} = require('sanctuary-env');
const error = require('http-errors');
const config = require('config');

//data TokenType = Authorization | Refresh
const Authorization = 1;
const Refresh = 2;

//    tokenLife :: Number
const tokenLife = config.get('security.tokenLife');

//    refreshLife :: Number
const refreshLife = config.get('security.refreshLife');

//    tokenClaimKeys :: Array String
const tokenClaimKeys = ['_', 't', '$', 'iat', 'exp'];

//    invalidClaims :: InvalidRequestError
const invalidClaims = error(400, 'Given token does not contain exactly the expected claims');

//    invalidTokenType :: InvalidRequestError
const invalidTokenType = error(400, 'Refresh token cannot be used for authorization');

//    invalidSessionType :: InternalServerError
const invalidSessionType = error(500, 'Unexpected session data structure');

//    tokenExpired :: NotAuthorizedError
const tokenExpired = error(403, 'Token expired');

//    isValidClaims :: Object -> Boolean
const isValidClaims = pipe([Object.keys, difference(tokenClaimKeys), isEmpty]);

//    validateClaims :: Either Error Claims -> Either Error Claims
const validateClaims = chain(claims => isValidClaims(claims) ? Right(claims) : Left(invalidClaims));

//      createTokenPair :: (Object -> Either Error a) -> Any -> Future Error [a, a]
exports.createTokenPair = curry((encode, session) => Future.do(function*() {

  const id = yield randomString(16);

  const refreshClaims = {
    _: id,
    t: Refresh,
    exp: Date.now() + refreshLife
  };

  const authClaims = {
    _: id,
    t: Authorization,
    $: session,
    iat: Date.now(),
    exp: Date.now() + tokenLife
  };

  return yield Future.both(
    eitherToFuture(encode(authClaims)),
    eitherToFuture(encode(refreshClaims))
  );

}));

//      tokenToSession :: (String -> Either Error a) -> TypeRep a -> String -> Either Error a
exports.tokenToSession = curry((decode, Type, token) => pipe([
  decode,
  validateClaims,
  chain(claims =>
    claims.t !== Authorization
    ? Left(invalidTokenType)
    : claims.iat < (Date.now() - tokenLife)
    ? Left(tokenExpired)
    : Right(claims)),
  map(get(Type, '$')),
  chain(maybeToEither(invalidSessionType))
], token));

//TODO: Implement refreshTokenPair
//      refreshTokenPair :: (String -> Either Error Object) -- token decoder
//                       -> String                          -- authentication token
//                       -> String                          -- refresh token
//                       -> Either Error [String, String]   -- either of new token pair
// exports.refreshTokenPair = curry((decode, token, refresh) => {
// });
