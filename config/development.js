'use strict';

module.exports = {
  server: {
    cors: ['http://localhost:4000', 'http://127.0.0.1:4000'],
    http: {
      port: 3000
    },
    https: {
      port: 3443
    },
  },
  log: {
    level: 'debug'
  },
  security: {
    secret: 'such secret'
  }
};
