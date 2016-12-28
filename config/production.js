'use strict';

const {transports} = require('winston');

module.exports = {
  log: {
    transports: [
      new transports.Console({
        align: true,
        colorize: false,
        timestamp: true
      })
    ]
  }
};
