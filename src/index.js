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

const cancel = program.fork(
  err => {
    log.error(err && err.stack || err);
    process.exit(1);
  },
  _ => {
    log.info('We hope you had a pleasant flight');
  }
);

process.once('SIGTERM', () => {
  log.info('Terminating forcefully');
  cancel();
  process.exit(2);
});
