'use strict';

const Future = require('fluture');
const {either, errorToJson} = require('../../prelude');

module.exports = req => Future.of(either(
  error => ({authenticated: false, reason: errorToJson(error)}),
  session => ({authenticated: true, session}),
  req.auth.session
));
