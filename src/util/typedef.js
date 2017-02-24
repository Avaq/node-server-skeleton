'use strict';

const t = require('tcomb');
const {T, pipe, pairs, filter, snd, fst, map, anyPass, values, complement} = require('../prelude');

const getErrors = pipe([pairs, filter(snd), map(fst)]);

module.exports = (name, Supertype, validations) => {

  const Type = t.refinement(Supertype, complement(anyPass(values(validations))), name);

  Type.getValidationErrorMessage = (v, path) => {
    const errors = getErrors(map(T(v), validations));
    return errors.length === 0
      ? undefined
      : `The ${path && path.length > 0 ? `'${path.join('.')}'` : name} ${errors.join(', and; ')}`;
  };

  return Type;

};
