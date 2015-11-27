'use strict';

import createError from 'http-errors';
import {line, warn} from '../util/common';
import {log} from 'util';

const normalizeError = err => {
  const {status, message, stack} = err;
  return Object.assign({
    status: 500,
    message: 'Something went wrong',
    stack: new Error('Unrecognised error').stack
  }, {status, message, stack});
};

export default router => {

  //Stacks that reach to here are 404.
  router.all('*', (req, res, next) => next(createError(404, line `
    There's nothing at ${req.method.toUpperCase()} ${req.path}
  `)));

  //Log errors.
  router.use((err, req, res, next) => {

    if(!err.status || err.status >= 500){
      return next(warn(err));
    }

    log(`${req.name}: [${err.status}] ${err.message}`);
    next(err);

  });

  //Error responses.
  /*eslint no-unused-vars:0*/
  router.use((err, req, res, next) => {
    const {status, message, stack} = normalizeError(err);
    const env = process.env.NODE_ENV;
    res.type('text');
    res.status(status);
    res.send(
      env === 'producton'
      ? status < 500
      ? message
      : `Error ${status} happened. :(`
      : stack
    );
  });

};
