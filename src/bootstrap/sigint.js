'use strict';

const {K} = require('sanctuary-env');
const {Middleware} = require('momi');
const Future = require('fluture');
const log = require('../util/log');

//This bootstrapper keeps the process alive until a SIGINT is received.
//     default :: a -> Middleware a b ()
module.exports = K(Middleware.lift(Future((rej, res) => {
  log.info('Ready\n');
  process.once('SIGINT', res);
})));
