'use strict';

const {line} = require('../util/common');
const {log, inspect} = require('util');

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
  router.use((req, res, next) => {
    log(`[REQUEST] ${req.name} (${inspect(req.query)})`);
    next();
  });

};
