'use strict';

const error = require('http-errors');
const log = require('./log');
const {I, either} = require('../prelude');

const missingPermission = error(403, `You are not authorized`);

module.exports = required => (req, res, next) =>
  req.auth.has(required)
    ? next()
    : next(either(I, sess => {
      log.debug(`User "${sess.user}" is missing the "${required}"-permission`);
      return missingPermission;
    }, req.auth.session));
