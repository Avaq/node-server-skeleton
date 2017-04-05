'use strict';

const Future = require('fluture');
const {either} = require('../../prelude');
const serialize = require('serialize-http-error');

module.exports = req => Future.of(either(
  error => ({authenticated: false, reason: serialize(error)}),
  session => ({authenticated: true, session}),
  req.auth.session
));
