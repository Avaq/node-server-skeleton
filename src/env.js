'use strict';

const {env, MaybeType, EitherType} = require('sanctuary');
const $ = require('sanctuary-def');
const {test, TypeVariable, NullaryType, UnaryTypeVariable} = $;
const FutureTypes = require('fluture-sanctuary-types');

const COMPARE_DOCS = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/'
  + 'Reference/Global_Objects/Array/sort#Description';

const E = module.exports;

const last = xs => xs[xs.length - 1];
const is = (T, x) => test(E.env, T, x);

env.forEach(type => E[`$${last(type.name.split('/'))}`] = type);

E.$a = TypeVariable('a');
E.$b = TypeVariable('b');
E.$c = TypeVariable('c');
E.$d = TypeVariable('d');
E.$e = TypeVariable('e');
E.$f = UnaryTypeVariable('f');
E.$g = TypeVariable('g');
E.$m = UnaryTypeVariable('m');

E.$Either = EitherType;
E.$Maybe = MaybeType;
E.$Array = $.Array;
E.$Function = $.Function;
E.$Pair = $.Pair;

E.$Compare = NullaryType('Compare', COMPARE_DOCS, x => x === -1 || x === 0 || x === 1);

E.$Future = FutureTypes.FutureType;
E.$ConcurrentFuture = FutureTypes.ConcurrentFutureType;

E.$ErrorLike = NullaryType('ErrorLike', '', x =>
  typeof x === 'string'
  || x instanceof Error
  || is(E.$Error, x)
);

E.$Buffer = NullaryType('Buffer', '', x => x instanceof Buffer);

E.env = env.concat(FutureTypes.env).concat([
  E.$Pair($.Unknown, $.Unknown),
  E.$Buffer,
  E.$ErrorLike
]);
