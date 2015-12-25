'use strict';

import {line} from '../util/common';
import {log, inspect} from 'util';

export default router => {

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
    log(`${req.name} (${inspect(req.query)})`);
    next();
  });

  //Access control.
  router.use((req, res, next) => {

    if(!req.headers.origin){
      return next();
    }

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');

    if(req.method !== 'OPTIONS'){
      return next();
    }

    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    res.end();

  });

};
