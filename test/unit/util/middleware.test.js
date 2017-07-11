'use strict';

const Future = require('fluture');
const {Middleware} = require('momi');
const {race} = require('../../../src/util/middleware');

describe('Middleware utilities', () => {

  describe('race', () => {

    const mx = Middleware.of('x');
    const mslow = Middleware.lift(Future.after(20, 'slow'));

    it('returns a Middleware', () => {
      expect(race(mx, mx)).to.be.an.instanceof(Middleware);
    });

    it('races two middleware against one another', done => {
      const m1 = race(mx, mslow);
      const m2 = race(mslow, mx);
      const m3 = race(mslow, mslow);
      const r1 = m1.run('state1');
      const r2 = m2.run('state2');
      const r3 = m3.run('state3');
      r1.fork(done, x => {
        expect(x).to.have.property('_1', 'x');
        expect(x).to.have.property('_2', 'state1');
      });
      r2.fork(done, x => {
        expect(x).to.have.property('_1', 'x');
        expect(x).to.have.property('_2', 'state2');
      });
      r3.fork(done, x => {
        expect(x).to.have.property('_1', 'slow');
        expect(x).to.have.property('_2', 'state3');
      });
      setTimeout(done, 50, null);
    });

  });

});
