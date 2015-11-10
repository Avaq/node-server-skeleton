'use strict';

import server from './app';
import config from 'config';
import executiveUser from 'executive-user';
import mkdebug from 'debug';

const debug = mkdebug('app');

const connection = server.listen(
  config.get('server.port'),
  config.get('server.host'),
  () => {
    const addr = connection.address();
    executiveUser(config.get('process.uid'), config.get('process.gid'));
    debug('Server listening on %s:%s', addr.address, addr.port);
  }
);
