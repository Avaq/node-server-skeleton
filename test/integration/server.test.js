'use strict';

import supertest from 'supertest';
import server from '../../src/app';

const req = supertest(server);

describe('HTTP Server', () => {

  it('responds to requests', done => {
    req.get('/').end(done);
  });

});
