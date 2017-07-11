'use strict';

const {create: createDef} = require('sanctuary-def');
const {create: createSanctuary} = require('sanctuary');
const Future = require('fluture');
const {Functor, Foldable} = require('sanctuary-type-classes');
const {
  env,
  $Array,
  $Boolean,
  $Buffer,
  $Either,
  $Error,
  $Function,
  $Future,
  $List,
  $Maybe,
  $Pair,
  $ReadableStream,
  $String,
  $StrMap,
  $a, $b, $c, $f
} = require('./env');

const checkTypes = process.env.NODE_ENV === 'development' ||
                   process.env.NODE_ENV === 'test';

const def = createDef({env, checkTypes});

const $ = module.exports = Object.create(createSanctuary({env, checkTypes}));

//awaitStream :: ReadableStream Buffer -> Future Error Buffer
$.awaitStream = def('awaitStream',
  {}, [$ReadableStream($Buffer), $Future($Error, $Buffer)],
  stream => Future((rej, res) => {
    const chunks = [];
    stream.on('data', d => chunks.push(d));
    stream.once('error', rej);
    stream.once('end', _ => res(Buffer.concat(chunks)));
    return () => stream.destroy(new Error('Cancelled'));
  }));

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
  (f, xs, ys) => {
    const l = Math.min(xs.length, ys.length), zs = new Array(l);
    for(let i = 0; i < l; i += 1) { zs[i] = f(xs[i])(ys[i]); }
    return zs;
  });

//contains :: a -> List a -> Boolean
$.contains = def('contains',
  {}, [$a, $List($a), $Boolean],
  (x, xs) => xs.indexOf(x) >= 0);

//fst :: Pair a b -> a
$.fst = def('fst',
  {}, [$Pair($a, $b), $a],
  ([a, _]) => a);

//snd :: Pair a b -> b
$.snd = def('snd',
  {}, [$Pair($a, $b), $b],
  ([_, b]) => b);

//duplicate :: a -> Pair a a
$.duplicate = def('duplicate',
  {}, [$a, $Pair($a, $a)],
  a => [a, a]);

//pair :: a -> b -> Pair a b
$.pair = def('pair',
  {}, [$a, $b, $Pair($a, $b)],
  (a, b) => [a, b]);

//toStrMap :: Foldable f => f (Pair String a) -> StrMap a
$.toStrMap = def('toStrMap',
  {f: [Foldable]}, [$f($Pair($String, $a)), $StrMap($a)],
  $.reduce_((o, [k, v]) => Object.assign({[k]: v}, o), {}));

//replace :: String -> String -> String -> String
$.replace = def('replace',
  {}, [$String, $String, $String, $String],
  (a, b, s) => s.replace(a, b));

//flap :: Functor f => f (a -> b) -> a -> f b
$.flap = def('flap',
  {f: [Functor]}, [$f($Function([$a, $b])), $a, $f($b)],
  (f, x) => $.map($.T(x), f));
