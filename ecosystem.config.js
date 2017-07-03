'use strict';

const {main} = require('./package.json');

/* eslint-disable camelcase */
exports.apps = [
  {
    name: 'server',
    script: main,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss,SSSS',
    exec_mode: 'cluster',
    node_args: '--optimize_for_size --max_old_space_size=920 --gc_interval=100',
    instances: 0,
    wait_ready: true
  }
];
