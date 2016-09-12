'use strict';

const meta = require('../../package');
const Future = require('fluture');
const {evolve, map, pipe, always} = require('ramda');

module.exports = pipe(
  always(Future.of({
    name: meta.name,
    version: meta.version,
    machine: process.env.HOSTNAME || process.env.HOST || '<unknown>',
    uptime: '<unknown>',
    user: process.env.USERNAME || process.env.USER || '<unknown>'
  })),
  map(evolve({
    uptime: process.uptime
  }))
);
