'use strict';

const {T} = require('sanctuary-env');
const {readStream, read, writeStream, write} = require('../services/cache');

const config = require('config').get('cache');

module.exports = T({
  readStream: readStream(config),
  read: read(config),
  writeStream: writeStream(config),
  write: write(config)
});
