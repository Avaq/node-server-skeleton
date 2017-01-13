'use strict';

const https = require('https');
const {B, T} = require('sanctuary-env');
const {getService} = require('../util/service');
const log = require('../util/log');
const {Middleware, App} = require('momi');
const Future = require('fluture');
const fs = require('fs');

const readFile = x => Future.node(done => fs.readFile(x, done));

const mountApp = (app, key, cert, host, port) => Middleware.lift(Future.node(done => {
  const conn = https.createServer({key, cert}, app).listen(port, host, err => done(err, conn));
}));

module.exports = App.do(function*(next) {

  const config = yield getService('config').chain(B(Middleware.lift, T('server.https')));

  if(!config.enabled) {
    log.verbose('HTTPS server is not enabled');
    return yield next;
  }

  log.verbose('HTTPS server starting...');

  const [key, cert] = Middleware.lift(Future.both(readFile(config.key), readFile(config.cert)));
  const app = yield getService('app');
  const connections = new Set;
  const server = yield mountApp(app, key, cert, config.host, config.port);

  server.on('connection', connection => {
    connection.once('close', _ => connections.delete(connection));
    connections.add(connection);
  });

  const addr = server.address();
  log.info(`HTTPS server started on ${addr.address}:${addr.port}`);

  const res = yield next;

  log.verbose('HTTPS server stopping...');

  yield Middleware.lift(Future.node(done => {
    connections.forEach(connection => connection.destroy());
    server.close(done);
  }));

  log.verbose('HTTPS server stopped');

  return res;

});
