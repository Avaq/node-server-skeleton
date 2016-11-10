'use strict';

const Future = require('fluture');
const {either} = require('sanctuary');

module.exports = req => either(
  Future.reject,
  session => Future.of({session, permissions: req.permissions}),
  req.session
);
