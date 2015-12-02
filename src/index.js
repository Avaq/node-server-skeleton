'use strict';

import {readFile} from './util/common';
import {fromNode} from './util/future';
import server from './app';
import config from 'config';
import executiveUser from 'executive-user';
import {log, warn} from 'util';
import https from 'https';
import http from 'http';
import {Future} from 'ramda-fantasy';

let connectingServers = 0;

const setExecutiveUser = () => --connectingServers > 0 || executiveUser(
  config.get('process.uid'),
  config.get('process.gid')
);

if(config.get('server.http.enabled')){
  connectingServers += 1;
  const connection = http.createServer(server).listen(
    config.get('server.http.port'),
    config.get('server.http.host'),
    () => {
      const addr = connection.address();
      log('HTTP Server listening on %s:%s', addr.address, addr.port);
      setExecutiveUser();
    }
  )
}

if(config.get('server.https.enabled')){
  connectingServers += 1;
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
    setExecutiveUser();
  })
}
