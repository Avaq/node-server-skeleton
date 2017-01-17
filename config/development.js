'use strict';

module.exports = {
  server: {
    cors: ['http://localhost:4000', 'http://127.0.0.1:4000'],
  },
  log: {
    level: 'debug'
  },
  security: {
    secret: 'such secret'
  }
};
