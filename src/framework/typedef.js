'use strict';

import t from 'tcomb';
import {pipe} from 'sanctuary';
import {isEmpty} from 'ramda';

export default (type, validate, name) => {
  const Type = t.refinement(type, pipe([validate, isEmpty]), name);
  Type.getValidationErrorMessage = validate;
  return Type;
};
