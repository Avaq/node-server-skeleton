'use strict';

const {Middleware} = require('momi');
const Future = require('fluture');
const log = require('../util/log');
const {K} = require('../prelude');

//This bootstrapper keeps the process alive until a SIGINT is received.
//     default :: a -> Middleware a b ()
module.exports = K(Middleware.lift(Future((rej, res) => {
  log.info('Ready for take-off\n');
  process.once('SIGINT', _ => {
    process.removeAllListeners('uncaughtException');
    log.info('Starting exit procedure...');
    res(1);
  });
})));
