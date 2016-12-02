'use strict';

const error = require('http-errors');
const Future = require('fluture');
const {eitherToFuture} = require('../util/future');
const {randomString} = require('../util/hash');
const {pipe, get, Left, Right, maybeToEither} = require('sanctuary-env');
const {chain, curry, difference, isEmpty, map} = require('ramda');

//data TokenType = Authorization | Refresh
const Authorization = 1;
const Refresh = 2;

//    tokenClaimKeys :: Array String
const tokenClaimKeys = ['_', 't', '$', 'iat', 'exp'];

//    refreshClaimKeys :: Array String
const refreshClaimKeys = ['_', 't', 'exp'];

//    invalidTokenClaims :: InvalidRequestError
const invalidTokenClaims = error(400, {
  name: 'InvalidTokenClaimsError',
  message: 'Given token does not contain exactly the expected claims'
});

//    invalidRefreshClaims :: InvalidRequestError
const invalidRefreshClaims = error(400, {
  name: 'InvalidRefreshClaimsError',
  message: 'Given refresh token does not contain exactly the expected claims'
});

//    invalidTokenType :: InvalidRequestError
const invalidTokenType = error(400, {
  name: 'InvalidTokenTypeError',
  message: 'An invalid type of token was provided where an Authorization token was expected'
});

//    invalidRefreshType :: InvalidRequestError
const invalidRefreshType = error(400, {
  name: 'InvalidRefreshTypeError',
  message: 'An invalid type of token was provided where a Refresh token was expected'
});

//    invalidSessionType :: InternalServerError
const invalidSessionType = error(500, {
  name: 'InvalidSessionTypeError',
  message: 'Unexpected session data type'
});

//    tokenExpired :: NotAuthorizedError
const tokenExpired = error(401, {
  name: 'TokenExpiredError',
  message: 'Token expired'
});

//    refreshExpired :: NotAuthorizedError
const refreshExpired = error(401, {
  name: 'RefreshExpiredError',
  message: 'Token expired'
});

//    tokenNotExpired :: InvalidRequestError
const tokenNotExpired = error(400, {
  name: 'TokenNotExpiredError',
  message: 'Token has not expired yet'
});

//    pairIdMismatch :: InvalidRequestError
const pairIdMismatch = error(400, {
  name: 'PairIdMismatchError',
  message: 'Token pair identity mismatch'
});

//    isValidTokenClaims :: Object -> Boolean
const isValidTokenClaims = pipe([Object.keys, difference(tokenClaimKeys), isEmpty]);

//    isValidRefreshClaims :: Object -> Boolean
const isValidRefreshClaims = pipe([Object.keys, difference(refreshClaimKeys), isEmpty]);

//    validateTokenClaims :: Either Error Claims -> Either Error Claims
const validateTokenClaims = chain(claims =>
  isValidTokenClaims(claims) ? Right(claims) : Left(invalidTokenClaims)
);

//      createTokenPair :: Number -> Number -> (b -> Either Error a) -> b -> Future Error [a, a]
exports.createTokenPair = curry((tokenLife, refreshLife, encode, session) => Future.do(function*() {

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

//      tokenToSession :: Number -> (b -> Either Error a) -> TypeRep a -> b -> Either Error a
exports.tokenToSession = curry((tokenLife, decode, Type, token) => pipe([
  decode,
  validateTokenClaims,
  chain(claims =>
    claims.t !== Authorization
    ? Left(invalidTokenType)
    : claims.iat < (Date.now() - tokenLife)
    ? Left(tokenExpired)
    : Right(claims)),
  map(get(Type, '$')),
  chain(maybeToEither(invalidSessionType))
], token));

//      verifyTokenPair :: Number -> Number -> AuthorizationClaims -> RefreshClaims -> Session
exports.verifyTokenPair = curry((tokenLife, refreshLife, token, refresh) =>
  !isValidTokenClaims(token)
  ? Left(invalidTokenClaims)
  : !isValidRefreshClaims(refresh)
  ? Left(invalidRefreshClaims)
  : token.t !== Authorization
  ? Left(invalidTokenType)
  : refresh.t !== Refresh
  ? Left(invalidRefreshType)
  : token._ !== refresh._
  ? Left(pairIdMismatch)
  : token.iat > (Date.now() - tokenLife)
  ? Left(tokenNotExpired)
  : token.iat < (Date.now() - refreshLife)
  ? Left(refreshExpired)
  : Right(token.$)
);
