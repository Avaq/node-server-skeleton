'use strict';

const meta = require('../../package');
const Future = require('fluture');

module.exports = req => Future.of({
  name: meta.name,
  version: meta.version,
  machine: process.env.HOSTNAME || process.env.HOST || '<unknown>',
  uptime: process.uptime(),
  user: process.env.USERNAME || process.env.USER || '<unknown>',
  request: req.name,
  ip: req.ip
});
