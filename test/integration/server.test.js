'use strict';

const supertest = require('supertest');
const setup = require('../../src/setup');
const Future = require('fluture');
const {version} = require('../../package');

const noop = () => {};
const co = gen => Future.do(gen).promise();
const asyncTest = gen => () => co(gen);

let req, send, allDone;

before('setup', done => {
  setup(({app}) => Future((rej, res) => {
    req = supertest(app);
    send = request => Future.node(done => request.end(done));
    allDone = res;
    done();
  })).fork(done, noop);
});

after(() => allDone());

describe('HTTP Server', () => {

  it('responds to requests', asyncTest(function*() {
    const res = yield send(req.get('/').set('Api-Version', version));
    yield Future.try(() => {
      expect(res.status).to.equal(200);
    });
  }));

});
