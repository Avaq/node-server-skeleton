'use strict';

const {Middleware} = require('momi');
const Future = require('fluture');
const log = require('../util/log');
const {K} = require('../prelude');

//This bootstrapper keeps the process alive until a SIGINT is received.
//     default :: a -> Middleware a b ()
module.exports = K(Middleware.lift(Future((rej, res) => {
  log.info('Ready\n');
  process.once('SIGINT', res);
})));
