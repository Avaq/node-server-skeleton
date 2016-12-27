'use strict';

const createError = require('http-errors');
const log = require('../util/log');
const {line, getErrorString, errorToJson} = require('../util/common');

module.exports = router => {

  //Stacks that reach to here are 404.
  router.all('*', (req, res, next) => next(createError(404, line `
    There's nothing at ${req.method.toUpperCase()} ${req.path}
  `)));

  //Log errors.
  router.use((err, req, res, next) => {

    if(!err.status || err.status >= 500) {
      log.error(`${req.name}: Errored: ${getErrorString(err)}`);
    } else {
      log.info(`${req.name}: [${err.status}] ${err.message}`);
    }

    return void next(err);

  });

  //Error responses.
  //Respond with JSON errors.
  router.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500).send(errorToJson(err));
  });

};
