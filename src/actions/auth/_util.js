'use strict';

const error = require('http-errors');
const Future = require('fluture');
const {eitherToFuture} = require('../../util/future');
const {randomString} = require('../../util/hash');
const config = require('config');
const {K, pipe, at, get, Left, Right, maybeToEither, or} = require('sanctuary-env');
const {chain, ifElse, test, split, trim, curry, difference, isEmpty, map} = require('ramda');

//data TokenType = Authorization | Refresh
const Authorization = 1;
const Refresh = 2;

//    tokenLife :: Number
const tokenLife = config.get('security.tokenLife');

//    refreshLife :: Number
const refreshLife = config.get('security.refreshLife');

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

//    missingAuthorizationHeader :: NotAuthorizedError
const missingAuthorizationHeader = error(401, {
  name: 'MissingAuthorizationHeaderError',
  message: 'Missing Authorization header'
});

//    missingTokenCookie :: NotAuthorizedError
const missingTokenCookie = error(401, {
  name: 'MissingTokenCookieError',
  message: 'Missing Cookie header'
});

//    malformedAuthorizationHeader :: InvalidRequestError
const malformedAuthorizationHeader = error(400, {
  name: 'MalformedAuthorizationHeaderError',
  message: 'Malformed Authorization header'
});

//    malformedAuthorizationHeader :: InvalidRequestError
const invalidAuthorizationHeader = error(400, {
  name: 'InvalidAuthorizationHeaderError',
  message: 'Authorization method must be Bearer'
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

//      createTokenPair :: (b -> Either Error a) -> b -> Future Error [a, a]
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

//      tokenToSession :: (b -> Either Error a) -> TypeRep a -> b -> Either Error a
exports.tokenToSession = curry((decode, Type, token) => pipe([
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

//      verifyTokenPair -> AuthorizationClaims -> RefreshClaims -> Session
exports.verifyTokenPair = curry((token, refresh) =>
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

//    getTokenFromHeaders :: Headers -> Either Error String
const getTokenFromHeaders = pipe([
  get(String, 'authorization'),
  maybeToEither(missingAuthorizationHeader),
  chain(ifElse(
    test(/^ *Bearer:/),
    pipe([split(':'), at(1), map(trim), maybeToEither(malformedAuthorizationHeader)]),
    K(Left(invalidAuthorizationHeader))
  ))
]);

//    getTokenFromCookies :: Cookies -> Either Error String
const getTokenFromCookies = pipe([
  get(String, 'token'),
  maybeToEither(missingTokenCookie)
]);

//      getTokenFromRequest :: Request -> Either Error String
exports.getTokenFromRequest = req =>
  req.method === 'GET'
  ? or(getTokenFromCookies(req.cookies), getTokenFromHeaders(req.headers))
  : getTokenFromHeaders(req.headers);
