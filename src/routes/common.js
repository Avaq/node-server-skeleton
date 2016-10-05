'use strict';

const {line} = require('../util/common');
const {log, inspect} = require('util');
const logRequests = require('config').get('server.requestLogging');

module.exports = router => {

  //Give requests a name for logging purposes.
  router.use((req, res, next) => {
    req.name = line `
      ${req.xhr ? 'AJAX' : ''}
      ${req.method.toUpperCase()}
      ${req.originalUrl.split('?')[0]}
    `;
    next();
  });

  //Request logging.
  if(logRequests) {
    router.use((req, res, next) => {
      log(`[REQUEST] ${req.name} (${inspect(req.query)})`);
      next();
    });
  }

};
