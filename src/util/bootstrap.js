'use strict';

const {resolve} = require('path');
const Future = require('fluture');

//    safeRequire :: Path -> Future Error a
const safeRequire = path => Future.try(_ => require(resolve(__dirname, '../bootstrap', path)));

//     default :: Path -> (Service -> Future Error a) -> Future Error a
module.exports = (path, cont) => Future.do(function*() {

  const bootstrap = yield safeRequire(path).mapRej(err => new Error(
    `Failed to bootstrap the "${path}" service: ${err.message}`
  ));

  if(typeof bootstrap !== 'function') {
    yield Future.reject(new Error(`The "${path}" service does not export a function.`));
  }

  const m = bootstrap(service => {
    const m = cont(service);
    return Future.isFuture(m) ? m : Future.reject(new Error(
      `The continuation provided to the "${path}" service did not return a Future`
    ));
  });

  if(!Future.isFuture(m)) {
    yield Future.reject(new Error(`The "${path}" service did not return a Future`));
  }

  return yield m;

});
