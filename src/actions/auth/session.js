'use strict';

const Future = require('fluture');
const permissions = require('config').get('permissions');
const {K, either, concat, pipe, get, maybe} = require('sanctuary-env');
const {chain} = require('ramda');
const error = require('http-errors');
const mm = require('micromatch');
const {getTokenFromRequest, tokenToSession} = require('./_util');

//    authenticatedGroups :: Array Group
const authenticatedGroups = ['@authenticated'];

//    unauthenticatedGroups :: Array Group
const unauthenticatedGroups = ['@unauthenticated'];

//    missingPermission :: String -> NotAuthorizedError
const missingPermission = x => error(403, `You are missing the ${x} permission`);

//    getUserGroups :: User -> Array Group
const getUserGroups = pipe([
  get(Array, 'groups'),
  maybe(authenticatedGroups, concat(authenticatedGroups))
]);

//    getUserGroupsFromSession :: Either Error Session -> Array Group
const getUserGroupsFromSession = either(K(unauthenticatedGroups), getUserGroups);

//    groupsToPermissions :: Array Group -> Array String
const groupsToPermissions = chain(group => permissions[group] || []);

//Export a middleware which determines the user session and attaches it to request.auth.
module.exports = req => {

  //    getSession :: Token -> Either Error Session
  const getSession = tokenToSession(req.services.token.decode, Object);

  //    session :: Either Error Session
  const session = getTokenFromRequest(req).chain(getSession);

  //    groups :: Array Group
  const groups = getUserGroupsFromSession(session);

  //    permissions :: Array String
  const permissions = groupsToPermissions(groups);

  //    has :: String -> Boolean
  const has = x => mm.any(x, permissions);

  //    guard -> Future NotAuthorizedError ()
  const guard = x => Future((l, r) => has(x) ? r() : l(missingPermission(x)));

  //Return side-effects in a Future.
  return Future.try(_ => {
    req.auth = {session, groups, permissions, has, guard};
  });

};
