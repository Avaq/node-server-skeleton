'use strict';

const Future = require('fluture');
const permissions = require('config').get('permissions');
const {either, concat, pipe, get, maybe} = require('sanctuary-env');
const {objOf, map, chain} = require('ramda');
const {ObjectId} = require('mongodb');
const {maybeToFuture} = require('../../util/future');
const error = require('http-errors');
const mm = require('micromatch');

//    authorizedGroups :: Array String
const authorizedGroups = ['@authorized'];

//    unauthorizedGroups :: Array String
const unauthorizedGroups = ['@unauthorized'];

//    userNotFound :: NotAuthorizedError
const userNotFound = error(403, 'User provided by token does not exist');

//    missingPermission :: String -> NotAuthorizedError
const missingPermission = x => error(403, `You are missing the ${x} permission`);

module.exports = req => pipe([
  either(
    err => (err.status || 500) >= 500 ? Future.reject(err) : Future.of(unauthorizedGroups),
    pipe([
      ObjectId,
      objOf('_id'),
      req.services.users.get,
      chain(maybeToFuture(userNotFound)),
      map(get(Array, 'groups')),
      map(maybe(authorizedGroups, concat(authorizedGroups)))
    ])
  ),
  map(chain(group => permissions[group] || [])),
  map(permissions => {
    const hasPermission = x => permissions.some(y => mm.isMatch(x, y));
    req.permissions = permissions;
    req.hasPermission = hasPermission;
    req.verifyPermission = x => Future((l, r) => hasPermission(x) ? r() : l(missingPermission(x)));
    return null;
  })
], req.session);
