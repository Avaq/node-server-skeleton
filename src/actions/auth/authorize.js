'use strict';

const {eitherToFuture} = require('../../util/future');
const {K} = require('sanctuary-env');

module.exports = req => eitherToFuture(req.session).map(K(null));
