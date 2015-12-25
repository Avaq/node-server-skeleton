'use strict';

import mkdebug from 'debug';
import {isNil} from 'ramda';

const debug = mkdebug('framework.dispatch');

const send = (req, res, val) => {

  debug('Sending response');

  if(typeof val.pipe === 'function'){
    return val.pipe(res);
  }

  res.send(val);

};

export default file => {

  const action = require(`../actions/${file}`).default;

  debug('Create action dispatcher: %s', file);

  return (req, res, next) => action(req, res).fork(next, val => (
    res.headersSent
    ? null
    : isNil(val)
    ? next()
    : send(req, res, val)
  ));

}
