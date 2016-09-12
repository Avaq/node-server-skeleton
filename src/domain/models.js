'use strict';

const {struct} = require('tcomb');
const T = require('./types');

//An example model.
exports.Example = struct({
  status: T.ResponseStatus,
  message: T.String
}, 'Example');
