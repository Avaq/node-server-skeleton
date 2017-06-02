'use strict';

const bootstrap = require('./bootstrap');
const log = require('./util/log');
const {App} = require('momi');

const program = App.run(
  bootstrap
  .use(require('./bootstrap/http'))
  .use(require('./bootstrap/sigint')),
  null
);

program.fork(
  err => {
    log.error(err && err.stack || err);
    process.exit(1);
  },
  _ => {
    process.removeAllListeners();
    log.info('We hope you had a pleasant flight');
  }
);
