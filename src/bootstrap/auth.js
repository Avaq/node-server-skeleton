'use strict';

const {B, T} = require('sanctuary-env');
const {App, Middleware} = require('momi');
const {createTokenPair, tokenToSession, verifyTokenPair} = require('../services/auth');
const {putService, getService} = require('../util/service');

//    load :: a -> (a -> Future b c) -> Middleware b c
const load = B(B(Middleware.lift), T);

module.exports = App.do(function*(next) {
  const {tokenLife, refreshLife} = yield getService('config').chain(load('security'));
  const {encode, decode} = yield getService('token');
  yield putService('auth', {
    createTokenPair: createTokenPair(tokenLife, refreshLife, encode),
    tokenToSession: tokenToSession(tokenLife, decode, Object),
    verifyTokenPair: verifyTokenPair(tokenLife, refreshLife)
  });
  return yield next;
});
