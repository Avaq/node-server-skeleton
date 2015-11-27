'use strict';

import server from './app';
import config from 'config';
import executiveUser from 'executive-user';
import {log} from 'util';

const connection = server.listen(
  config.get('server.port'),
  config.get('server.host'),
  () => {
    const addr = connection.address();
    executiveUser(config.get('process.uid'), config.get('process.gid'));
    log('[SERVER] Listening on %s:%s', addr.address, addr.port);
  }
);
