'use strict';

const {create: createDef} = require('sanctuary-def');
const {create: createSanctuary} = require('sanctuary');
const Future = require('fluture');
const {Functor} = require('sanctuary-type-classes');
const {
  env,
  $Array,
  $Buffer,
  $Either,
  $ErrorLike,
  $Function,
  $Future,
  $Maybe,
  $Pair,
  $String,
  $a, $b, $c, $f
} = require('./env');

const options = {env, checkTypes: process.env.NODE_ENV === 'development'};
const def = createDef(options);

const zipArrayWith = (f, xs, ys) => {
  const l = Math.min(xs.length, ys.length), zs = new Array(l);
  for(let i = 0; i < l; i += 1) {
    zs[i] = f(xs[i])(ys[i]);
  }
  return zs;
};

const $ = module.exports = Object.create(createSanctuary(options));

//maybeToFuture :: a -> Maybe b -> Future a b
$.maybeToFuture = def('maybeToFuture',
  {}, [$a, $Maybe($b), $Future($a, $b)],
  (e, m) => $.maybe(Future.reject(e), Future.of, m));

//eitherToFuture :: Either a b -> Future a b
$.eitherToFuture = def('eitherToFuture',
  {}, [$Either($a, $b), $Future($a, $b)],
  $.either(Future.reject, Future.of));

//attempt :: Future a b -> Future c (Either a b)
$.attempt = def('attempt',
  {}, [$Future($a, $b), $Future($c, $Either($a, $b))],
  Future.fold($.Left, $.Right));

//errorToString :: ErrorLike -> String
$.errorToString = def('errorToString',
  {}, [$ErrorLike, $String],
  err => (err && err.message) || (err.toString ? err.toString() : String(err)));

//tap :: (a -> b) -> a -> a
$.tap = def('tap',
  {}, [$Function([$a, $b]), $a, $a],
  (f, x) => { f(x); return x; });

//ftap :: Functor f => (a -> f b) -> a -> f a
$.ftap = def('ftap',
  {f: [Functor]}, [$Function([$a, $f($b)]), $a, $f($a)],
  (f, x) => $.map(() => x, f(x)));

//encodeBuffer :: String -> Buffer -> String
$.encodeBuffer = def('encodeBuffer',
  {}, [$String, $Buffer, $String],
  (encoding, buf) => buf.toString(encoding));

//zip :: (a -> b -> c) -> Array a -> Array b -> Array c
$.zip = def('zip',
  {}, [$Function([$a, $Function([$b, $c])]), $Array($a), $Array($b), $Array($c)],
  zipArrayWith);

//fst :: Pair a b -> a
$.fst = def('fst',
  {}, [$Pair($a, $b), $a],
  ([a, _]) => a);

//snd :: Pair a b -> b
$.snd = def('snd',
  {}, [$Pair($a, $b), $b],
  ([_, b]) => b);
