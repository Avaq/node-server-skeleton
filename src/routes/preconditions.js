'use strict';

const error = require('http-errors');
const semver = require('semver');
const meta = require('../../package');

module.exports = router => {

  //JSON headers.
  router.use((req, res, next) => {
    next(req.accepts('json') ? null : error(406, 'Must accept JSON response.'));
  });

  //API-version.
  router.use((req, res, next) => {

    const v = req.get('api-version') || req.query._apiv;

    if(!semver.valid(v)) {
      return void next(error(400, 'No valid API version provided.'));
    }

    if(semver.gt(v, meta.version)) {
      return void next(error(400, `API version ${v} does not exist yet.`));
    }

    return void next();

  });

};
