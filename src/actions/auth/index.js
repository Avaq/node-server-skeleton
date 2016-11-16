'use strict';

const Future = require('fluture');
const {either} = require('sanctuary');
const {errorToJson} = require('../../util/common');

module.exports = req => Future.of(either(
  error => ({
    authorized: false,
    session: errorToJson(error),
    groups: req.auth.groups,
    permissions: req.auth.permissions
  }),
  session => ({
    authorized: true,
    session: session.user,
    groups: req.auth.groups,
    permissions: req.auth.permissions
  }),
  req.auth.session
));
