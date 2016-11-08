'use strict';

const {inter} = require('tcomb');
const T = require('./types');

exports.Authentication = inter({
  username: T.Username,
  password: T.Password
}, 'Authentication');

exports.Authorization = inter({
  token: T.String,
  refresh: T.String
}, 'Authorization');
