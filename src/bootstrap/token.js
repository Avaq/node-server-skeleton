'use strict';

const {B, T} = require('sanctuary-env');
const {encode, decode} = require('../services/token');
const {App, Middleware} = require('momi');
const {putService, getService} = require('../util/service');

module.exports = App.do(function*(next) {
  const secret = yield getService('config').chain(B(Middleware.lift, T('security.secret')));
  yield putService('token', {
    encode: encode(secret),
    decode: decode(secret)
  });
  return yield next;
});
