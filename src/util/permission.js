'use strict';

const error = require('http-errors');
const {I, either} = require('sanctuary-env');
const debug = require('debug')('util.permission');

const missingPermission = error(403, `You are not authorized`);

module.exports = required => (req, res, next) =>
  req.auth.has(required)
  ? next()
  : next(either(I, sess => {
    debug(`User "${sess.user}" is missing the "${required}"-permission`);
    return missingPermission;
  }, req.auth.session));
