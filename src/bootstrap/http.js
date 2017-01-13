'use strict';

const http = require('http');
const {B, T} = require('sanctuary-env');
const {getService} = require('../util/service');
const log = require('../util/log');
const {Middleware, App} = require('momi');
const Future = require('fluture');

const mountApp = (app, host, port) => Middleware.lift(Future.node(done => {
  const conn = http.createServer(app).listen(port, host, err => done(err, conn));
}));

module.exports = App.do(function*(next) {

  const config = yield getService('config').chain(B(Middleware.lift, T('server.http')));

  if(!config.enabled) {
    log.verbose('HTTP server is not enabled');
    return yield next;
  }

  log.verbose('HTTP server starting...');

  const app = yield getService('app');
  const connections = new Set;
  const server = yield mountApp(app, config.host, config.port);

  server.on('connection', connection => {
    connection.once('close', _ => connections.delete(connection));
    connections.add(connection);
  });

  const addr = server.address();
  log.info(`HTTP server started on ${addr.address}:${addr.port}`);

  const res = yield next;

  log.verbose('HTTP server stopping...');

  yield Middleware.lift(Future.node(done => {
    connections.forEach(connection => connection.destroy());
    server.close(done);
  }));

  log.verbose('HTTP server stopped');

  return res;

});
