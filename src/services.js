'use strict';

const config = require('config');
const cacheService = require('./services/cache');
const tokenService = require('./services/token');

const cacheConfig = config.get('cache');
const tokenConfig = config.get('security.secret');

exports.cache = {
  readStream: cacheService.readStream(cacheConfig),
  read: cacheService.read(cacheConfig),
  writeStream: cacheService.writeStream(cacheConfig),
  write: cacheService.write(cacheConfig)
};

exports.token = {

  //encode :: Object -> Either Error String
  encode: tokenService.encode(tokenConfig),

  //decode :: String -> Either Error Object
  decode: tokenService.decode(tokenConfig)

};
