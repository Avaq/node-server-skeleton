'use strict';

const Future = require('fluture');
const permissions = require('config').get('permissions');
const {either, concat, pipe, get, maybe} = require('sanctuary-env');
const {objOf, map, chain} = require('ramda');
const {ObjectId} = require('mongodb');
const {maybeToFuture} = require('../../util/future');
const error = require('http-errors');

const authorizedGroups = ['@authorized'];
const unauthorizedGroups = ['@unauthorized'];

module.exports = req => pipe([
  either(
    err => (err.status || 500) >= 500 ? Future.reject(err) : Future.of(unauthorizedGroups),
    pipe([
      ObjectId,
      objOf('_id'),
      req.services.users.get,
      chain(maybeToFuture(error(403, 'User token does not exist'))),
      map(get(Array, 'groups')),
      map(maybe(authorizedGroups, concat(authorizedGroups)))
    ])
  ),
  map(chain(group => permissions[group] || [])),
  map(permissions => {
    req.permissions = permissions;
    return null;
  })
], req.session);
