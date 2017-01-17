'use strict';

const {transports} = require('winston');

module.exports = {
  log: {
    level: 'info',
    transports: [
      new transports.Console({
        align: true,
        colorize: false,
        timestamp: true
      })
    ]
  }
};
