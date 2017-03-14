'use strict';

const semver = require('semver');
const error = require('http-errors');
const {find, maybe} = require('../prelude');

const predicates = {
  satisfies: 'compliant with',
  gt: 'greater than',
  gte: 'greater than or equal to',
  lt: 'less than',
  lte: 'less than or equal to',
  eq: 'equal to',
  neq: 'different from'
};

module.exports = callbacks => (req, res, next) => {
  const userVersion = req.header('api-version');
  const versions = Object.keys(callbacks);
  const dispatch = k => _ => callbacks[k](req, res, next);
  const match = find(v => semver.satisfies(userVersion, v), versions);
  maybe(next, dispatch, match)();
};

Object.keys(predicates).forEach(k => {

  module.exports[k] = version => (req, res, next) => {
    const userVersion = req.header('api-version');
    next(semver[k](userVersion, version) ? null : error(
      412, `Version ${userVersion} is not ${predicates[k]} version ${version}`,
      {expected: version, actual: userVersion, predicate: k}
    ));
  };

});
