'use strict';

const Future = require('fluture');
const {either} = require('sanctuary');

module.exports = req => either(
  Future.reject,
  session => Future.of({
    session: session,
    groups: req.auth.groups,
    permissions: req.auth.permissions
  }),
  req.auth.session
);
