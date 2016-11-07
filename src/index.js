'use strict';

const config = require('config');
const {log} = require('util');
const https = require('https');
const http = require('http');
const Future = require('fluture');
const fs = require('fs');
const destroyable = require('server-destroy');
const setup = require('./setup');

const readFile = x => Future.node(done => fs.readFile(x, done));

const program = setup(({app}) => {

  //This Future creates an HTTP server.
  const httpServer = Future.node(done => {
    const connection = http.createServer(app).listen(
      config.get('server.http.port'),
      config.get('server.http.host'),
      err => done(err, connection)
    );
    destroyable(connection);
  })
  .map(connection => {
    const addr = connection.address();
    log('[MAIN] HTTP Server listening on %s:%s', addr.address, addr.port);
    return connection;
  });

  //The next Future creates an HTTPS server.
  const KEY = config.get('server.https.key');
  const CERT = config.get('server.https.cert');
  const httpsServer = Future.both(readFile(KEY), readFile(CERT))
  .chain(([key, cert]) => Future.node(done => {
    const connection = https.createServer({key, cert}, app).listen(
      config.get('server.https.port'),
      config.get('server.https.host'),
      err => done(err, connection)
    );
    destroyable(connection);
  }))
  .map(connection => {
    const addr = connection.address();
    log('[MAIN] HTTPS Server listening on %s:%s', addr.address, addr.port);
    return connection;
  });

  //Determine which servers to load.
  const servers = []
  .concat(config.get('server.http.enabled') ? [httpServer] : [])
  .concat(config.get('server.https.enabled') ? [httpsServer] : []);

  //Load servers and setup shut-down logic.
  return Future.parallel(Infinity, servers)
  .chain(servers => Future((rej, res) => {
    log('[MAIN] Ready for action, cowboy!');
    process.once('SIGINT', _ => {
      log('[MAIN] SIGINT - Shutting down');
      servers.forEach(server => server.destroy());
      res();
    });
  }));

});

const cancel = program.fork(
  err => {
    console.error(err.stack); //eslint-disable-line
    process.exit(1);
  },
  _ => {
    log('[MAIN] Process finished');
    process.exit(0);
  }
);

process.on('SIGTERM', () => {
  log('[MAIN] Terminating forcefully');
  cancel();
  process.exit(2);
});
