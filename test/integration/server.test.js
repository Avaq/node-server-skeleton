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

  describe('/auth', () => {

    let token;

    it('sends me a token-pair when I post my username and password', asyncTest(function*() {

      const res = yield send(req.post('/auth').set('Api-Version', version).send({
        username: 'avaq',
        password: 'password123'
      }));

      yield Future.try(_ => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('refresh');
      });

      token = res.body.token;

    }));

    it('authorizes me when I include the token in my headers', asyncTest(function*() {

      const res = yield send(
        req.get('/auth')
        .set('Api-Version', version)
        .set('Authorization', `Bearer: ${token}`)
      );

      yield Future.try(_ => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('authorized', true);
        expect(res.body).to.have.property('session', 'avaq');
        expect(res.body).to.have.property('groups');
        expect(res.body).to.have.property('permissions');
      });

    }));

  });

});
