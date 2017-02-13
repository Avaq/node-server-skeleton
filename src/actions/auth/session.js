'use strict';

const Future = require('fluture');
const {K, either, concat, pipe, get, maybe, at, Left, maybeToEither, or} = require('sanctuary-env');
const {chain, ifElse, test, split, trim, map} = require('ramda');
const error = require('http-errors');
const mm = require('micromatch');

//    authenticatedGroups :: Array Group
const authenticatedGroups = ['@everyone', '@authenticated'];

//    unauthenticatedGroups :: Array Group
const unauthenticatedGroups = ['@everyone', '@unauthenticated'];

//    missingPermission :: String -> NotAuthorizedError
const missingPermission = x => error(403, `You are missing the ${x} permission`);

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

//    getTokenFromRequest :: Request -> Either Error String
const getTokenFromRequest = req =>
  req.method === 'GET'
  ? or(getTokenFromCookies(req.cookies), getTokenFromHeaders(req.headers))
  : getTokenFromHeaders(req.headers);

//    getUserGroups :: User -> Array Group
const getUserGroups = pipe([
  get(Array, 'groups'),
  maybe(authenticatedGroups, concat(authenticatedGroups))
]);

//    getUserGroupsFromSession :: Either Error Session -> Array Group
const getUserGroupsFromSession = either(K(unauthenticatedGroups), getUserGroups);

//Export a middleware which determines the user session and attaches it to request.auth.
module.exports = req => Future.do(function*() {

  //    grants :: {String: Array String}
  const grants = yield req.services.config('permissions');

  //    groupsToPermissions :: Array Group -> Array String
  const groupsToPermissions = chain(group => grants[group] || []);

  //    session :: Either Error Session
  const session = getTokenFromRequest(req).chain(req.services.auth.tokenToSession);

  //    groups :: Array Group
  const groups = getUserGroupsFromSession(session);

  //    permissions :: Array String
  const permissions = groupsToPermissions(groups);

  //    has :: String -> Boolean
  const has = x => mm.any(x, permissions);

  //    guard -> Future NotAuthorizedError ()
  const guard = x => Future((l, r) => has(x) ? r() : l(missingPermission(x)));

  req.auth = {session, groups, permissions, has, guard};

});
