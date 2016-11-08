'use strict';

const {getTokenFromHeaders} = require('./_util');
const {eitherToFuture} = require('../../util/future');
const {tokenToSession} = require('../../util/auth');
const {B} = require('sanctuary-env');

module.exports = req => {

  //    getSession :: String -> Future Error Session
  const getSession = B(eitherToFuture, tokenToSession(req.services.token.decode, Number));

  return getTokenFromHeaders(req.headers)
  .chain(getSession)
  .map(session => {
    req.session = session;
    return null;
  });

};
