'use strict';

const {Router} = require('express');
const log = require('./log');
const {curry} = require('ramda');

module.exports = curry((server, file) => {
  const router = new Router();
  log.debug(`Mounting routes: ${file}`);
  require(`../routes/${file}`)(router);
  server.use(router);
});
