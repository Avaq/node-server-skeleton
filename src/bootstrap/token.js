'use strict';

const {T} = require('sanctuary-env');
const {encode, decode} = require('../services/token');

const config = require('config').get('security.secret');

module.exports = T({
  encode: encode(config),
  decode: decode(config)
});
