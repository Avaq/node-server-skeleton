'use strict';

const Future = require('fluture');
const permissions = require('config').get('permissions');
const {either, concat, pipe, get, maybe} = require('sanctuary-env');
const {objOf, map, chain} = require('ramda');
const {ObjectId} = require('mongodb');
const {maybeToFuture} = require('../../util/future');
const error = require('http-errors');
const mm = require('micromatch');
const {getTokenFromHeaders, tokenToSession} = require('./_util');

//    authorizedGroups :: Array String
const authorizedGroups = ['@authorized'];

//    unauthorizedGroups :: Array String
const unauthorizedGroups = ['@unauthorized'];

//    userNotFound :: NotAuthorizedError
const userNotFound = error(403, 'User provided by token does not exist');

//    missingPermission :: String -> NotAuthorizedError
const missingPermission = x => error(403, `You are missing the ${x} permission`);

//    getUserGroups :: User -> Array Group
const getUserGroups = pipe([
  get(Array, 'groups'),
  maybe(authorizedGroups, concat(authorizedGroups))
]);

//    groupsToPermissions :: Array Group -> Array String
const groupsToPermissions = chain(group => permissions[group] || []);

//Export a middleware which determines the user session and attaches it to request.auth.
module.exports = req => {

  //    findUserById :: UserId -> Future NotFoundError User
  const findUserById = pipe([
    ObjectId,
    objOf('_id'),
    req.services.users.get,
    chain(maybeToFuture(userNotFound))
  ]);

  //    getUserGroupsFromSession :: Either Error UserId -> Future Error (Array Group)
  const getUserGroupsFromSession = either(
    err => (err.status || 500) >= 500 ? Future.reject(err) : Future.of(unauthorizedGroups),
    pipe([findUserById, map(getUserGroups)])
  );

  //    getSession :: Token -> Either Error UserId
  const getSession = tokenToSession(req.services.token.decode, String);

  //    session :: Either Error UserId
  const session = getTokenFromHeaders(req.headers).chain(getSession);

  //return :: Future Error Null
  return getUserGroupsFromSession(session).map(groups => {
    const permissions = groupsToPermissions(groups);
    const has = x => permissions.some(y => mm.isMatch(x, y));
    const guard = x => Future((l, r) => has(x) ? r() : l(missingPermission(x)));
    req.auth = {session, groups, permissions, has, guard};
    return null;
  });

};
