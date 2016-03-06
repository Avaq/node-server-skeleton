'use strict';

import {readFile} from './util/common';
import {fromNode} from './util/future';
import server from './app';
import config from 'config';
import {log, warn} from 'util';
import https from 'https';
import http from 'http';
import Future from 'fluture';
import cuteStack from 'cute-stack';

cuteStack(process.env.NODE_ENV === 'development' ? Infinity : 5);

if(config.get('server.http.enabled')){
  const connection = http.createServer(server).listen(
    config.get('server.http.port'),
    config.get('server.http.host'),
    () => {
      const addr = connection.address();
      log('HTTP Server listening on %s:%s', addr.address, addr.port);
    }
  )
}

if(config.get('server.https.enabled')){
  Future.of(key => cert => fromNode(done => {
    const connection = https.createServer({key, cert}, server).listen(
      config.get('server.https.port'),
      config.get('server.https.host'),
      err => done(err, connection)
    )
  }))
  .ap(readFile(config.get('server.https.key')))
  .ap(readFile(config.get('server.https.cert')))
  .chain(m => m)
  .fork(err => (warn(err), process.exit(1)), connection => {
    const addr = connection.address();
    log('HTTPS Server listening on %s:%s', addr.address, addr.port);
  })
}
