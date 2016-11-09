'use strict';

const mm = require('micromatch');
const error = require('http-errors');

module.exports = required => (req, res, next) =>
  req.permissions.some(permission => mm.isMatch(required, permission))
  ? next()
  : next(error(403, `You are missing the ${required} permission`));
