'use strict';

//
// WARNING
// Do not modify this file! Instead read the readme on how to do configuration!
//

const {transports} = require('winston');

module.exports = {

  //Web server configuration.
  server: {

    //White-list of domains allowed to access our resources.
    cors: [],

    //IP address to bind to.
    host: '0.0.0.0',

    //Port to listen on.
    port: 3000

  },

  //Logs
  log: {

    //Common log level (for all transports)
    level: 'verbose',

    //Winston transports
    transports: [
      new transports.Console({
        align: true,
        colorize: true,
        timestamp: false
      })
    ]
  },

  //Security-related parameters.
  security: {

    //Please configure the secret on your deployment server. Every instance
    //must have the same secret, but the secret should not be comitted.
    secret: null,

    //Please note that the token-life also determines the time it takes for
    //changes in user-permissions to be propagated.
    tokenLife: 21600000, /*6 hours*/
    refreshLife: 1209600000 /*14 days*/

  },

  //Group permission configuration. Matches made using https://github.com/jonschlinkert/micromatch
  //All users are automatically part of the @everyone group.
  //All logged-out users are automatically part of the @unauthenticated group.
  //All logged-in users are automatically part of the @authenticated group.
  permissions: {
    '@everyone': ['auth.*', 'ping'],
    '@unauthenticated': [],
    '@authenticated': ['*']
  }

};
