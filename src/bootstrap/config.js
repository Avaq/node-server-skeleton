'use strict';

const {K} = require('sanctuary-env');
const config = require('config');
const {putService} = require('../util/service');
const Future = require('fluture');

//    loadConfig :: String -> Middleware a Error Any
const loadConfig = prop => Future.try(_ => config.get(prop));

//This bootstrapper registers a config service which loads application settings.
module.exports = next => putService('config', loadConfig).chain(K(next));
