'use strict';

const {env, MaybeType, EitherType} = require('sanctuary');
const $ = require('sanctuary-def');
const {test, TypeVariable, NullaryType, BinaryType, UnaryTypeVariable} = $;
const F = require('fluture');

const F_DOCS = 'https://github.com/Avaq/Fluture';
const COMPARE_DOCS = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/'
  + 'Reference/Global_Objects/Array/sort#Description';

const last = xs => xs[xs.length - 1];
const is = (T, x) => test(exports.env, T, x);

env
.filter(type => typeof type.name === 'string' && type.name.length > 0)
.forEach(type => exports[`$${last(type.name.split('/'))}`] = type);

exports.$a = TypeVariable('a');
exports.$b = TypeVariable('b');
exports.$c = TypeVariable('c');
exports.$d = TypeVariable('d');
exports.$e = TypeVariable('e');
exports.$f = UnaryTypeVariable('f');
exports.$g = TypeVariable('g');
exports.$m = UnaryTypeVariable('m');

exports.$Either = EitherType;
exports.$Maybe = MaybeType;
exports.$Array = $.Array;
exports.$Function = $.Function;
exports.$Pair = $.Pair;

exports.$Compare = NullaryType('Compare', COMPARE_DOCS, x => x === -1 || x === 0 || x === 1);

exports.$Future = BinaryType(F.name, F_DOCS, F.isFuture, F.extractLeft, F.extractRight);

exports.$ErrorLike = NullaryType('ErrorLike', '', x =>
  typeof x === 'string'
  || x instanceof Error
  || is(exports.$Error, x)
);

exports.$Buffer = NullaryType('Buffer', '', x => x instanceof Buffer);

exports.env = env.concat([
  exports.$Future($.Unknown, $.Unknown),
  exports.$Pair($.Unknown, $.Unknown),
  exports.$Buffer,
  exports.$ErrorLike
]);
