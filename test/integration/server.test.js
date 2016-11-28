'use strict';

const supertest = require('supertest');
const bootstrap = require('../../src/bootstrap');
const Future = require('fluture');
const {version} = require('../../package');
const {App, Middleware} = require('momi');
const {prop} = require('sanctuary-env');

const co = gen => Future.do(gen).promise();
const asyncTest = gen => () => co(gen);
const send = request => Future.node(done => request.end(done));

const serverTests = services => describe('HTTP Server', () => {

  const req = supertest(services.app);

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
        expect(res.body).to.have.property('authenticated', true);
        expect(res.body).to.have.property('session');
        expect(res.body.session).to.be.an('object');
        expect(res.body.session).to.have.property('user', 'avaq');
        expect(res.body.session).to.have.property('groups');
      });

    }));

    it('does not authorize me when the token is missing', asyncTest(function*() {

      const res = yield send(
        req.get('/auth')
        .set('Api-Version', version)
      );

      yield Future.try(_ => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('authenticated', false);
        expect(res.body).to.have.property('reason');
        expect(res.body.reason).to.be.an('object');
        expect(res.body.reason).to.have.property('name', 'MissingAuthorizationHeaderError');
        expect(res.body.reason).to.have.property('message');
      });

    }));

  });

});

before('bootstrap', run => {

  const testBootstrapper = _ =>
    Middleware.get
    .map(prop('services'))
    .map(serverTests)
    .chain(_ => Middleware.lift(Future((rej, res) => {
      after('unbootstrap', res);
      run();
    })));

  App.run(bootstrap.use(testBootstrapper), null).fork(
    err => {
      console.error(err.stack || String(err)); //eslint-disable-line
      process.exit(1);
    },
    done => done()
  );

});

//This is a work-around because --delay does not work with --require.
describe('Setup', () => it('runs', () => {}));
