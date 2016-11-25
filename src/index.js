'use strict';

const bootstrap = require('./bootstrap');
const {log} = require('util');
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
    console.error(err.stack); //eslint-disable-line
    process.exit(1);
  },
  _ => {
    log('[MAIN] Process finished');
    process.exit(0);
  }
);

process.on('SIGTERM', () => {
  log('[MAIN] Terminating forcefully');
  cancel();
  process.exit(2);
});
