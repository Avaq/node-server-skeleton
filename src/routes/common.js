'use strict';

const {line} = require('../util/common');
const {log} = require('util');
const logRequests = require('config').get('server.requestLogging');
const {contains} = require('ramda');
const whitelist = require('config').get('server.cors');
const cookieParser = require('cookie-parser');

module.exports = router => {

  //Give requests a name for logging purposes.
  router.use((req, res, next) => {
    req.name = line `
      ${req.xhr ? 'AJAX' : ''}
      ${req.method.toUpperCase()}
      ${req.originalUrl}
    `;
    next();
  });

  //Request logging.
  if(logRequests) {
    router.use((req, res, next) => {
      log(`[REQUEST] ${req.name}`);
      next();
    });
  }

  //Access control.
  router.use((req, res, next) => {

    if(!contains(req.headers.origin, whitelist)) {
      return void (req.method === 'OPTIONS' ? res.end() : next());
    }

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');

    if(req.method !== 'OPTIONS') {
      return void next();
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    return void res.end();

  });

  //Parse cookies in all GET requests.
  router.get('*', cookieParser());

};
