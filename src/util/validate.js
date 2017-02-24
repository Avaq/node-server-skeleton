'use strict';

const {validate: validate_} = require('tcomb-validation');
const createError = require('http-errors');
const Future = require('fluture');
const {curry2} = require('../prelude');

//validate :: Type -> a -> Future[BadRequestError, a]
module.exports = curry2((Type, a) => Future((rej, res) => {
  const validation = validate_(a, Type);
  const err = validation.firstError();
  validation.isValid() ? res(a) : rej(createError(400, err.message));
}));
