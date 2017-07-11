'use strict';

const Future = require('fluture');
const log = require('./log');

const send = (res, val) => {

  log.debug('Sending response');

  if(typeof val.pipe === 'function') {
    return void val.pipe(res);
  }

  return void res.json(val);

};

const forkAction = (res, next) => val => void (
  res.headersSent
    ? undefined
    : val === null || val === undefined
      ? next()
      : send(res, val)
);

const runAction = (action, req, res, next) => {
  const ret = action(req, res);
  return ret instanceof Future ? (ret.fork(next, forkAction(res, next)), true) : false;
};

const createDispatcher = file => {
  const action = require(`../actions/${file}`);
  log.debug('Create action dispatcher: %s', file);
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
