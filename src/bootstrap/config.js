'use strict';

const config = require('config');
const {putService} = require('../util/service');
const Future = require('fluture');
const {App} = require('momi');
const log = require('../util/log');

//    loadConfig :: String -> Future Error Any
const loadConfig = prop => Future.try(_ => config.get(prop));

//This bootstrapper registers a config service which loads application settings.
module.exports = App.do(function*(next) {

  if(process.env.NODE_ENV) {
    log.info(`Running with ${process.env.NODE_ENV} environment`);
  } else {
    log.warn('Running without environment');
  }

  yield putService('config', loadConfig);

  return yield next;

});
