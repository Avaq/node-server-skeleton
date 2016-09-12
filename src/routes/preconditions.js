'use strict';

const error = require('http-errors');
const {has, contains} = require('ramda');
const semver = require('semver');
const meta = require('../../package');
const whitelist = require('config').get('server.xhr.whitelist');

module.exports = router => {

  //Access control.
  router.use((req, res, next) => {

    if(!contains(req.header.origin, whitelist)) {
      return void next();
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

  //JSON headers.
  router.use((req, res, next) => {
    next(req.accepts('json') ? null : error(406, 'Must accept JSON response.'));
  });

  //API-version.
  router.use((req, res, next) => {

    const v = req.get('api-version');

    if(!semver.valid(v)) {
      return void next(error(400, 'No valid API version provided.'));
    }

    if(semver.gt(v, meta.version)) {
      return void next(error(400, `API version ${v} does not exist yet.`));
    }

    return void next();

  });

};
