'use strict';

import server from '../services/http';
import {Router} from 'express';
import mkdebug from 'debug';
const debug = mkdebug('framework.route');

export default file => {
  const router = new Router();
  debug('Mounting routes: %s', file);
  require(`../routes/${file}`)(router);
  server.use(router);
}
