'use strict';

const config = require('config');
const {putService} = require('../util/service');
const Future = require('fluture');
const {App, Middleware} = require('momi');
const log = require('../util/log');

//    loadConfig :: String -> Future Error Any
const loadConfig = prop => Future.try(_ => config.get(prop));

//This bootstrapper registers a config service which loads application settings.
module.exports = App.do(function*(next) {

  if(!process.env.NODE_ENV) {
    yield Middleware.lift(Future.reject(new Error('NODE_ENV is not set')));
  }

  log.info(`Using "${process.env.NODE_ENV}" configurations`);

  yield putService('config', loadConfig);

  return yield next;

});
