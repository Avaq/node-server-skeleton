'use strict';

const mkdebug = require('debug');
const {isNil} = require('ramda');
const Future = require('fluture');

const debug = mkdebug('framework.dispatch');

const send = (res, val) => {

  debug('Sending response');

  if(typeof val.pipe === 'function') {
    return void val.pipe(res);
  }

  return void res.json(val);

};

const forkAction = (res, next) => val => void (
  res.headersSent
  ? undefined
  : isNil(val)
  ? next()
  : send(res, val)
);


const runAction = (action, req, res, next) => {
  const ret = action(req, res);
  return ret instanceof Future ? (ret.fork(next, forkAction(res, next)), true) : false;
};

const createDispatcher = file => {
  const action = require(`../actions/${file}`);
  debug('Create action dispatcher: %s', file);
  return function dispatcher(req, res, next) {
    if(!runAction(action, req, res, next)) {
      throw new TypeError(`The "${file}"-action did not return a Future`);
    }
  };
};

const middleware = action => function dispatcher(req, res, next) {
  if(!runAction(action, req, res, next)) {
    throw new TypeError('An action did not return a Future');
  }
};

module.exports = createDispatcher;
module.exports.send = send;
module.exports.forkAction = forkAction;
module.exports.middleware = middleware;
