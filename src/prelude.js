'use strict';

const {create: createDef} = require('sanctuary-def');
const {create: createSanctuary} = require('sanctuary');
const Future = require('fluture');
const {Functor} = require('sanctuary-type-classes');
const {
  env,
  $Array,
  $Boolean,
  $Buffer,
  $Compare,
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

const cloneArray = xs => {
  const l = xs.length, ys = new Array(l);
  for(let i = 0; i < l; i++) {
    ys[i] = xs[i];
  }
  return ys;
};

const zipArrayWith = (f, xs, ys) => {
  const l = Math.min(xs.length, ys.length), zs = new Array(l);
  for(let i = 0; i < l; i += 1) {
    zs[i] = f(xs[i])(ys[i]);
  }
  return zs;
};

module.exports = exports = Object.create(createSanctuary(options));

//      maybeToFuture :: a -> Maybe b -> Future a b
exports.maybeToFuture = def('maybeToFuture',
  {}, [$a, $Maybe($b), $Future($a, $b)],
  (e, m) => exports.maybe(Future.reject(e), Future.of, m));

//      eitherToFuture :: Either a b -> Future a b
exports.eitherToFuture = def('eitherToFuture',
  {}, [$Either($a, $b), $Future($a, $b)],
  exports.either(Future.reject, Future.of));

//      attempt :: Future a b -> Future c (Either a b)
exports.attempt = def('attempt',
  {}, [$Future($a, $b), $Future($c, $Either($a, $b))],
  Future.fold(exports.Left, exports.Right));

//      errorToString :: ErrorLike -> String
exports.errorToString = def('errorToString',
  {}, [$ErrorLike, $String],
  err => (err && err.message) || (err.toString ? err.toString() : String(err)));

//      tap :: (a -> b) -> a -> a
exports.tap = def('tap',
  {}, [$Function([$a, $b]), $a, $a],
  (f, x) => { f(x); return x; });

//      ftap :: Functor f => (a -> f b) -> a -> f a
exports.ftap = def('ftap',
  {f: [Functor]}, [$Function([$a, $f($b)]), $a, $f($a)],
  (f, x) => exports.map(() => x, f(x)));

//      encodeBuffer :: String -> Buffer -> String
exports.encodeBuffer = def('encodeBuffer',
  {}, [$String, $Buffer, $String],
  (encoding, buf) => buf.toString(encoding));

//      sort :: (a -> a -> Compare) -> Array a -> Array a
exports.sort = def('sort',
  {}, [$Function([$a, $a, $Compare]), $Array($a), $Array($a)],
  (comparator, xs) => cloneArray(xs).sort(comparator));

//      arbitrarily :: a -> a -> Compare
exports.arbitrarily = def('arbitrarily',
  {}, [$a, $a, $Compare],
  (a, b) => a <= b ? a < b ? -1 : 0 : +1);

//      complement :: (a -> Boolean) -> a -> Boolean
exports.complement = def('complement',
  {}, [$Function([$a, $Boolean]), $a, $Boolean],
  (f, x) => !f(x));

//      zip :: (a -> b -> c) -> Array a -> Array b -> Array c
exports.zip = def('zip',
  {}, [$Function([$a, $Function([$b, $c])]), $Array($a), $Array($b), $Array($c)],
  zipArrayWith);

//      fst :: Pair a b -> a
exports.fst = def('fst',
  {}, [$Pair($a, $b), $a],
  ([a, _]) => a);

//      snd :: Pair a b -> b
exports.snd = def('snd',
  {}, [$Pair($a, $b), $b],
  ([_, b]) => b);
