'use strict';

const config = require('config');
const {log} = require('util');
const https = require('https');
const http = require('http');
const Future = require('fluture');
const fs = require('fs');
const path = require('path');
const app = require('./src/index');
const setup = require('./src/setup');

const readFile = x => Future.node(done => fs.readFile(x, done));

const httpServer = Future.node(done => {
  const connection = http.createServer(app).listen(
    config.get('server.http.port'),
    config.get('server.http.host'),
    err => done(err, connection)
  );
})
.map(connection => {
  const addr = connection.address();
  log('[MAIN] HTTP Server listening on %s:%s', addr.address, addr.port);
  return connection;
});

const httpsServer = Future.of(key => cert => Future.node(done => {
  const connection = https.createServer({key, cert}, app).listen(
    config.get('server.https.port'),
    config.get('server.https.host'),
    err => done(err, connection)
  );
}))
.ap(readFile(config.get('server.https.key')))
.ap(readFile(config.get('server.https.cert')))
.chain(m => m)
.map(connection => {
  const addr = connection.address();
  log('[MAIN] HTTPS Server listening on %s:%s', addr.address, addr.port);
  return connection;
});

const servers = []
.concat(config.get('server.http.enabled') ? [httpServer] : [])
.concat(config.get('server.https.enabled') ? [httpsServer] : []);

const cancel = setup.chain(_ => Future.parallel(2, servers)).fork(
  err => {
    console.error(err.stack); //eslint-disable-line
    process.exit(1);
  },
  servers => {
    log('[MAIN] Ready for action, cowboy!');
    process.on('SIGINT', () => {
      log('[MAIN] Closing servers');
      servers.forEach(server => server.close());
    });
  }
);

process.on('SIGINT', () => {
  log('[MAIN] Cancelling startup procedure');
  cancel();
});
