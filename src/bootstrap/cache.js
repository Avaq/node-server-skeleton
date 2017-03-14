'use strict';

const {readStream, read, writeStream, write} = require('../services/cache');
const {putService, getService} = require('../util/service');
const {App, Middleware} = require('momi');
const {map, T} = require('../prelude');

module.exports = App.do(function*(next) {
  const config = yield getService('config').chain(map(Middleware.lift, T('cache')));
  yield putService('cache', {
    readStream: readStream(config),
    read: read(config),
    writeStream: writeStream(config),
    write: write(config)
  });
  return yield next;
});
