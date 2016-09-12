'use strict';

const t = require('tcomb');
const {anyPass, values, toPairs, complement} = require('ramda');

module.exports = (name, Supertype, validations) => {

  const Type = t.refinement(Supertype, complement(anyPass(values(validations))), name);
  const pairs = toPairs(validations);

  Type.getValidationErrorMessage = (v, path) => {
    const faulty = pairs.find(pair => pair[1](v));
    return faulty && `The ${path && path.length > 0 ? `'${path.join('.')}'` : name} ${faulty[0]}`;
  };

  return Type;

};
