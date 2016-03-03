import {send, forkAction} from '../../../src/framework/dispatch';

const noop = () => {};

describe('Dispatch framework', () => {

  describe('.forkAction()', () => {

    it('always returns undefined', () => {
      const tests = [
        {res: {headersSent: true, send: noop}, val: null},
        {res: {headersSent: true, send: noop}, val: 'hi'},
        {res: {headersSent: false, send: noop}, val: null},
        {res: {headersSent: false, send: noop}, val: 'hi'}
      ];
      tests.forEach(({res, val}) => expect(forkAction(res, noop)(val)).to.be.undefined);
    });

    it('calls next when given a null value', () => {
      const res = {headersSent: false, send: noop};
      const next = sinon.spy();
      const val = null;
      forkAction(res, next)(val);
      expect(next).to.have.been.called;
    });

  });

  describe('.send()', () => {

    it('calls val.pipe with the res', () => {
      const val = {pipe: sinon.spy()};
      const res = {headersSent: false};
      send(res, val);
      expect(val.pipe).to.have.been.calledWith(res);
    });

    it('calls res.send with the value', () => {
      const val = 'hi';
      const res = {headersSent: false, send: sinon.spy()};
      send(res, val);
      expect(res.send).to.have.been.calledWith(val);
    });

  });

});
