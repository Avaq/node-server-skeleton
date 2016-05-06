'use strict';

import t from 'tcomb';
import {anyPass, values, toPairs, complement} from 'ramda';

export default (name, Supertype, validations) => {

  const Type = t.refinement(Supertype, complement(anyPass(values(validations))), name);
  const pairs = toPairs(validations);

  Type.getValidationErrorMessage = (v, path) => {
    const faulty = pairs.find(pair => pair[1](v));
    return faulty && `The ${path && path.length > 0 ? `'${path.join('.')}'` : name} ${faulty[0]}`;
  };

  return Type;

};
