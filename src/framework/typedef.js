'use strict';

import t from 'tcomb';
import {line} from '../util/common';
import {pipe, K} from 'sanctuary';
import {
  anyPass, values, compose, map, filter, propEq, take, prop, toPairs, into,
  ifElse, isEmpty, complement
} from 'ramda';

const transducePairs = compose(
  filter(propEq('bad', true)),
  take(1),
  map(prop('key'))
);

export default (name, Supertype, validations) => {

  const Type = t.refinement(Supertype, complement(anyPass(values(validations))), name);
  const pairs = toPairs(validations);

  Type.getValidationErrorMessage = (v, path) => pipe([
    into('', compose(map(([key, f]) => ({key, bad: f(v)})), transducePairs)),
    ifElse(isEmpty, K(undefined), msg => line `
      The ${path && path.length > 0 ? `'${path.join('.')}'` : name} ${msg}
    `)
  ], pairs);

  return Type;

};
