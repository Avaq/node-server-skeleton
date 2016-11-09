'use strict';

const {getTokenFromHeaders, tokenToSession} = require('./_util');
const Future = require('fluture');

module.exports = req => {
  const getSession = tokenToSession(req.services.token.decode, String);
  req.session = getTokenFromHeaders(req.headers).chain(getSession);
  return Future.of(null);
};
