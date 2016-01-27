'use strict';

import meta from '../../package';
import {K, pipe} from 'sanctuary';
import {Future} from 'ramda-fantasy';
import {evolve, map, unary} from 'ramda';

export default unary(pipe([
  K(Future.of({
    name: meta.name,
    version: meta.version,
    machine: process.env.HOSTNAME || process.env.HOST || '<unknown>',
    uptime: '<unknown>',
    user: process.env.USERNAME || process.env.USER || '<unknown>'
  })),
  map(evolve({
    uptime: process.uptime
  }))
]));
