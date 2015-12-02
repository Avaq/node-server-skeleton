'use strict';

import server from './app';
import config from 'config';
import executiveUser from 'executive-user';
import {log} from 'util';
import https from 'https';
import http from 'http';

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
  const key = (config.get('server.https.key'));
  const cert = (config.get('server.https.cert'));
  const connection = https.createServer({key, cert}, server).listen(
    config.get('server.https.port'),
    config.get('server.https.host'),
    () => {
      const addr = connection.address();
      log('HTTPS Server listening on %s:%s', addr.address, addr.port);
      setExecutiveUser();
    }
  )
}
