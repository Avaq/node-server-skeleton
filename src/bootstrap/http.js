'use strict';

const http = require('http');
const {getService} = require('../util/service');
const log = require('../util/log');
const {race} = require('../util/middleware');
const {Middleware, App} = require('momi');
const Future = require('fluture');
const {map, T} = require('../prelude');

const mountApp = (app, host, port) => Middleware.lift(Future.node(done => {
  const conn = http.createServer(app).listen(port, host, err => done(err, conn));
}));

module.exports = App.do(function*(next) {

  const config = yield getService('config').chain(map(Middleware.lift, T('server')));

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

  const res = yield race(next, Middleware.fromComputation(rej => {
    server.once('error', rej);
  }));

  log.verbose('HTTP server stopping...');

  connections.forEach(c => c.destroy());
  yield Middleware.lift(Future.node(server.close.bind(server)));

  log.verbose('HTTP server stopped');

  return res;

});
