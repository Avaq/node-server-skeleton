'use strict';

import mkdebug from 'debug';
import {isNil} from 'ramda';
import {Future} from 'ramda-fantasy';
import error from 'http-errors';

const debug = mkdebug('framework.dispatch');

export const send = (res, val) => {

  debug('Sending response');

  if(typeof val.pipe === 'function'){
    return void val.pipe(res);
  }

  return void res.send(val);

};

export const forkAction = (res, next) => val => void (
  res.headersSent
  ? undefined
  : isNil(val)
  ? next()
  : send(res, val)
);

/* istanbul ignore next */
const createDispatcher = file => {

  const action = require(`../actions/${file}`).default;

  debug('Create action dispatcher: %s', file);

  const dispatcher = (req, res, next) => {

    const ret = action(req, res);

    if(!(ret instanceof Future)){
      return void next(error(500, `The "${file}"-action did not return a Future`));
    }

    return void ret.fork(next, forkAction(res, next));

  };

  return dispatcher;

};

export default createDispatcher;
