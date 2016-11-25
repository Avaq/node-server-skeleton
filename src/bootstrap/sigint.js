'use strict';

const {K} = require('sanctuary-env');
const {Middleware} = require('momi');
const Future = require('fluture');
const {log} = require('util');

//This bootstrapper keeps the process alive until a SIGINT is received.
//     default :: a -> Middleware a b ()
module.exports = K(Middleware.lift(Future((rej, res) => {
  log('[BOOTSTRAP:SIGINT] Ready for action!');
  process.once('SIGINT', res);
})));
