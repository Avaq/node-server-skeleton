'use strict';

const {inter, list} = require('tcomb');
const T = require('./types');

exports.Authentication = inter({
  username: T.Username,
  password: T.Password
}, 'Authentication');

exports.Authorization = inter({
  token: T.String,
  refresh: T.String
}, 'Authorization');

exports.User = inter({
  username: T.Username,
  password: T.Password,
  groups: list(T.Group)
}, 'User');
