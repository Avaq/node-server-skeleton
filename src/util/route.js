'use strict';

const {Router} = require('express');
const mkdebug = require('debug');
const {curry} = require('ramda');

const debug = mkdebug('framework.route');

module.exports = curry((server, file) => {
  const router = new Router();
  debug('Mounting routes: %s', file);
  require(`../routes/${file}`)(router);
  server.use(router);
});
