'use strict';

import createError from 'http-errors';
import {line, warn} from '../util/common';
import {log} from 'util';

const normalizeError = err => Object.assign({
  status: 500,
  message: 'Something went wrong',
  stack: new Error('Unrecognised error').stack,
  expose: err.status < 500
}, err);

export default router => {

  //Stacks that reach to here are 404.
  router.all('*', (req, res, next) => next(createError(404, line `
    There's nothing at ${req.method.toUpperCase()} ${req.path}
  `)));

  //Log errors.
  router.use((err, req, res, next) => {

    if(!err.status || err.status >= 500){
      return void next(warn(err));
    }

    log(`${req.name}: [${err.status}] ${err.message}`);
    return void next(err);

  });

  //Error responses.
  /*eslint no-unused-vars:0*/
  router.use((err, req, res, next) => {
    const {status, message, expose} = normalizeError(err);
    res.type('text');
    res.status(status);
    res.send(expose ? message : `Error ${status} happened. :(`);
  });

};
