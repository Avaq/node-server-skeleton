'use strict';

const {Logger} = require('winston');
const config = require('config');

const log = config.get('log');

module.exports = new Logger(log);
