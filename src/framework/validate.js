'use strict';

import {validate as tvalidate} from 'tcomb-validation';
import createError from 'http-errors';
import Future from 'fluture';
import {curry} from 'ramda';

//validate :: Type -> a -> Future[BadRequestError, a]
export default curry((Type, a) => Future((rej, res) => {
  const validation = tvalidate(a, Type);
  const err = validation.firstError();
  validation.isValid() ? res(a) : rej(createError(400, err.message));
}));
