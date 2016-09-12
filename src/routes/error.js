'use strict';

const createError = require('http-errors');
const {line, getErrorString} = require('../util/common');
const {log} = require('util');

const toJSON = err => (
  typeof err.toJSON === 'function'
  ? err.toJSON(err)
  : err.expose || process.env.NODE_ENV !== 'production'
  ? err instanceof Error && err.message && err.name
  ? Object.assign({name: err.name, message: err.message}, err)
  : {name: 'Error', message: err.message || err.toString()}
  : {name: err.name || 'Error', message: 'A super secret error occurred'}
);

module.exports = router => {

  //Stacks that reach to here are 404.
  router.all('*', (req, res, next) => next(createError(404, line `
    [REQUEST] There's nothing at ${req.method.toUpperCase()} ${req.path}
  `)));

  //Log errors.
  router.use((err, req, res, next) => {

    if(!err.status || err.status >= 500) {
      console.warn(`[REQUEST] ${req.name}: Errored: ${getErrorString(err)}`); //eslint-disable-line
    } else {
      log(`[REQUEST] ${req.name}: [${err.status}] ${err.message}`);
    }

    return void next(err);

  });

  //Error responses.
  //Respond with JSON errors.
  router.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500).send(toJSON(err));
  });

};
