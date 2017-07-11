'use strict';

const {env, MaybeType, EitherType} = require('sanctuary');
const $ = require('sanctuary-def');
const {TypeVariable, NullaryType, UnaryType, UnaryTypeVariable, StrMap} = $;
const FutureTypes = require('fluture-sanctuary-types');
const {Readable} = require('stream');

const E = module.exports;

const last = xs => xs[xs.length - 1];

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
E.$StrMap = StrMap;

E.$Future = FutureTypes.FutureType;
E.$ConcurrentFuture = FutureTypes.ConcurrentFutureType;

E.$ReadableStream = UnaryType(
  'ReadableStream',
  'https://nodejs.org/api/stream.html#stream_readable_streams',
  x => x instanceof Readable,
  x => x._readableState.buffer.head ? [x._readableState.buffer.head.data] : []
);

E.$List = UnaryType(
  'List',
  'https://developer.mozilla.org/en-US/search?q=indexOf&topic=js',
  x => typeof x.indexOf === 'function',
  xs => typeof xs === 'string' ? [] : xs
);

E.$Buffer = NullaryType('Buffer', '', x => x instanceof Buffer);

E.env = env.concat(FutureTypes.env).concat([
  E.$ReadableStream($.Unknown),
  E.$Pair($.Unknown, $.Unknown),
  E.$Buffer
]);
