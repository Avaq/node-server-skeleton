'use strict';

import Future from 'fluture';
import {either, maybe, Left, Right} from 'sanctuary-env';
import {curry} from 'ramda';

//    maybeToFuture :: Maybe b -> a -> Future a b
export const maybeToFuture = curry((e, m) => maybe(Future.reject(e), Future.of, m));

//    eitherToFuture :: Either a b -> Future a b
export const eitherToFuture = either(Future.reject, Future.of);

//    attempt :: Future a b -> Future x (Either a b)
export const attempt = Future.fold(Left, Right);
