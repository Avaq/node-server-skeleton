'use strict';

const config = require('config');
const cacheService = require('./services/cache');

const cacheConfig = config.get('cache');

exports.cache = {
  readStream: cacheService.readStream(cacheConfig),
  read: cacheService.read(cacheConfig),
  writeStream: cacheService.writeStream(cacheConfig),
  write: cacheService.write(cacheConfig)
};
