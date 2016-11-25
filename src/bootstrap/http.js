'use strict';

const http = require('http');
const {T} = require('sanctuary-env');
const {getService} = require('../util/service');
const {Middleware, App} = require('momi');
const {log} = require('util');
const Future = require('fluture');

const mountApp = (app, host, port) => Middleware.lift(Future.node(done => {
  const conn = http.createServer(app).listen(port, host, err => done(err, conn));
}));

module.exports = App.do(function*(next) {

  const config = yield getService('config').chain(T('server.http'));

  if(!config.enabled) {
    log('[BOOTSTRAP:HTTP] Not enabled');
    return yield next;
  }

  log('[BOOTSTRAP:HTTP] Connecting...');

  const app = yield getService('app');
  const connections = new Set;
  const server = yield mountApp(app, config.host, config.port);

  server.on('connection', connection => {
    connection.once('close', _ => connections.delete(connection));
    connections.add(connection);
  });

  const addr = server.address();
  log('[BOOTSTRAP:HTTP] Server listening on %s:%s', addr.address, addr.port);

  const res = yield next;

  log('[BOOTSTRAP:HTTP] Disconnecting...');

  yield Middleware.lift(Future.node(done => {
    connections.forEach(connection => connection.destroy());
    server.close(done);
  }));

  log('[BOOTSTRAP:HTTP] Disconnected');

  return res;

});
