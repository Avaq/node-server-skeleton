'use strict';

import {fromNode} from '../util/future';
import {ftap} from '../util/common';
import {createConnection} from 'mysql';
import Future from 'fluture';
import {K} from 'sanctuary';
import {curry} from 'ramda';

//connect :: Object -> Future[Error, Connection]
export const connect = config => Future.cache(new Future((rej, res) => {
  const conn = createConnection(config);
  conn.connect(err => err ? rej(err) : res(conn));
}));

//query :: String -> [*] -> Connection -> Future[Error, Result]
export const query = curry((sql, data, conn) => new Future((rej, res) =>
  conn.query(sql, data, (err, result, meta) => err ? rej(err) : res({result, meta}))
));

//transaction :: (Connection -> Future[Error, a]) -> Connection -> Future[Error, a]
export const transaction = curry((operation, conn) =>
  fromNode(done => conn.beginTransaction(done))
  .chain(() => operation(conn))
  .chain(ftap(() => fromNode(done => conn.commit(done))))
  .chainReject(err => fromNode(done => conn.rollback(done)).chain(K(Future.reject(err))))
);
