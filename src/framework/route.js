'use strict';

import {Router} from 'express';
import mkdebug from 'debug';
import {curry} from 'ramda';

const debug = mkdebug('framework.route');

export default curry((server, file) => {
  const router = new Router();
  debug('Mounting routes: %s', file);
  require(`../routes/${file}`).default(router);
  server.use(router);
});
