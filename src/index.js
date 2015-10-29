/*eslint no-invalid-this:0*/
'use strict';

import server from './services/http';
import config from 'config';
import executiveUser from 'executive-user';
import mkdebug from 'debug';

const debug = mkdebug('skeleton.server');

const connection = server.listen(
  config.get('server.port'),
  config.get('server.host'),
  () => {
    const addr = connection.address();
    executiveUser(config.get('process.uid'), config.get('process.gid'));
    debug('Server listening on %s:%s', addr.address, addr.port);
  }
);
