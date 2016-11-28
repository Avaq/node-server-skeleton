'use strict';

const Future = require('fluture');
const {either} = require('sanctuary-env');
const {errorToJson} = require('../../util/common');

module.exports = req => Future.of(either(
  error => ({authenticated: false, reason: errorToJson(error)}),
  session => ({authenticated: true, session}),
  req.auth.session
));
