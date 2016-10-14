'use strict';

const supertest = require('supertest');
const server = require('../../src/index');
const Future = require('fluture');
const {version} = require('../../package');

const req = supertest(server);
const send = request => Future.node(done => request.end(done)).chain(res =>
  res.status < 400
  ? Future.of(res)
  : Future.reject(new Error(`API error: ${res.body.message}`))
);
const co = gen => Future.do(gen).promise();
const asyncTest = gen => () => co(gen);

describe('HTTP Server', () => {

  it('responds to requests', asyncTest(function*() {
    const res = yield send(req.get('/').set('Api-Version', version));
    yield Future.try(() => {
      expect(res.status).to.equal(200);
    });
  }));

});
