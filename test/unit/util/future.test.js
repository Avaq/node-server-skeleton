import * as util from '../../../src/util/future';
import Future from 'fluture';
import {Just, Nothing, Left, Right} from 'sanctuary';

const error = new Error('It broke');
const noop = x => x;

describe('Future utililities', () => {

  describe('.maybeToFuture()', () => {

    it('returns a resolved Future from a Just', () => {
      const spy = sinon.spy();
      const future = util.maybeToFuture(error, Just('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('returns a rejected Future from a Nothing', () => {
      const spy = sinon.spy();
      const future = util.maybeToFuture(error, Nothing());
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

  describe('.eitherToFuture()', () => {

    it('returns a resolved Future from a Right', () => {
      const spy = sinon.spy();
      const future = util.eitherToFuture(Right('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('returns a rejected Future from a Left', () => {
      const spy = sinon.spy();
      const future = util.eitherToFuture(Left(error));
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

});
