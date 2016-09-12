'use strict';

const supertest = require('supertest');
const server = require('../../src/index');

const req = supertest(server);

describe('HTTP Server', () => {

  it('responds to requests', done => {
    req.get('/').end(done);
  });

});
