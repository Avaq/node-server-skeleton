'use strict';

const error = require('http-errors');
const missingPermission = x => error(403, `You are missing the ${x} permission`);

module.exports = required => (req, res, next) =>
  req.auth.has(required) ? next() : next(missingPermission(required));
