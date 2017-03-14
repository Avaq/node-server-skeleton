'use strict';

const {Router} = require('express');
const log = require('./log');
const {curry2} = require('../prelude');

module.exports = curry2((server, file) => {
  const router = new Router();
  log.debug(`Mounting routes: ${file}`);
  require(`../routes/${file}`)(router);
  server.use(router);
});
