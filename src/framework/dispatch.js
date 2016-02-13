'use strict';

import mkdebug from 'debug';
import {isNil} from 'ramda';
import {Future} from 'ramda-fantasy';
import error from 'http-errors';

const debug = mkdebug('framework.dispatch');

const send = (req, res, val) => {

  debug('Sending response');

  if(typeof val.pipe === 'function'){
    return val.pipe(res);
  }

  res.send(val);

};

const createDispatcher = file => {

  const action = require(`../actions/${file}`).default;

  debug('Create action dispatcher: %s', file);

  const dispatcher = (req, res, next) => {

    const ret = action(req, res);

    if(!(ret instanceof Future)){
      return void next(error(500, `The "${file}"-action did not return a Future`));
    }

    const forkAction = val => (
      res.headersSent
      ? undefined
      : isNil(val)
      ? next()
      : send(req, res, val)
    );

    ret.fork(next, forkAction);

  };

  return dispatcher;

};

export default createDispatcher;
