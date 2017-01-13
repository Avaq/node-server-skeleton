'use strict';

const bootstrap = require('./bootstrap');
const log = require('./util/log');
const {App} = require('momi');

const program = App.run(
  bootstrap
  .use(require('./bootstrap/http'))
  .use(require('./bootstrap/https'))
  .use(require('./bootstrap/sigint')),
  null
);

const cancel = program.fork(
  err => {
    log.error(err.stack);
    process.exit(1);
  },
  _ => {
    log.info('Exited successfully');
    process.exit(0);
  }
);

process.on('SIGTERM', () => {
  log.info('Terminating forcefully');
  cancel();
  process.exit(2);
});
