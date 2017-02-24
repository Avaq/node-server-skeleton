'use strict';

const {encode, decode} = require('../services/token');
const {App, Middleware} = require('momi');
const {putService, getService} = require('../util/service');
const {map, T} = require('../prelude');

module.exports = App.do(function*(next) {
  const secret = yield getService('config').chain(map(Middleware.lift, T('security.secret')));
  yield putService('token', {
    encode: encode(secret),
    decode: decode(secret)
  });
  return yield next;
});
