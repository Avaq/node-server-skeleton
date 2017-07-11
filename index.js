'use strict';

const log = require('./src/util/log');
const {App} = require('momi');

const app = App.empty()
.use(require('./src/bootstrap/service'))
.use(require('./src/bootstrap/config'))
.use(require('./src/bootstrap/token'))
.use(require('./src/bootstrap/users'))
.use(require('./src/bootstrap/auth'))
.use(require('./src/bootstrap/app'))
.use(require('./src/bootstrap/http'))
.use(require('./src/bootstrap/sigint'));

App.run(app, null).fork(
  err => {
    log.error(err && err.stack || err);
    process.exit(1);
  },
  _ => {
    process.removeAllListeners();
    log.info('We hope you had a pleasant flight');
  }
);
