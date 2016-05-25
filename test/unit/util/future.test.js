import * as util from '../../../src/util/future';
import Future from 'fluture';
import {Just, Nothing, Left, Right, isLeft, isRight} from 'sanctuary-env';

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

  describe('.attempt()', () => {

    it('returns a (Future _ (Right x)) from a (Future _ x)', done => {
      const actual = util.attempt(Future.of(1));
      actual.fork(
        _ => {
          throw Error('The Future should bot have rejected')
        },
        m => {
          expect(isRight(m)).to.equal(true);
          expect(m.value).to.equal(1);
          done();
        }
      )
    });

    it('returns a (Future _ (Left e)) from a (Future e _)', done => {
      const actual = util.attempt(Future.reject(1));
      actual.fork(
        _ => {
          throw Error('The Future should bot have rejected')
        },
        m => {
          expect(isLeft(m)).to.equal(true);
          expect(m.value).to.equal(1);
          done();
        }
      )
    });

  });

});
