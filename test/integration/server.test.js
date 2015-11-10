'use strict';

import supertest from 'supertest';
import server from '../../src/services/http';

const req = supertest(server);

describe('HTTP Server', () => {

  it('responds to requests', done => {
    req.get('/').end(done);
  });

});
