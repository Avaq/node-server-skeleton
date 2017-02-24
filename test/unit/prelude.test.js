'use strict';

const P = require('../../src/prelude');
const Future = require('fluture');
const {Just, Nothing, Left, Right, isLeft, isRight} = require('../../src/prelude');

const noop = () => {};
const error = new Error('kaputt');

describe('Prelude', () => {

  describe('.maybeToFuture()', () => {

    it('returns a resolved Future from a Just', () => {
      const spy = sinon.spy();
      const future = P.maybeToFuture(error, Just('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('returns a rejected Future from a Nothing', () => {
      const spy = sinon.spy();
      const future = P.maybeToFuture(error, Nothing);
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

  describe('.eitherToFuture()', () => {

    it('returns a resolved Future from a Right', () => {
      const spy = sinon.spy();
      const future = P.eitherToFuture(Right('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('returns a rejected Future from a Left', () => {
      const spy = sinon.spy();
      const future = P.eitherToFuture(Left(error));
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

  describe('.attempt()', () => {

    it('returns a (Future _ (Right x)) from a (Future _ x)', done => {
      const actual = P.attempt(Future.of(1));
      actual.fork(
        _ => {
          throw Error('The Future should bot have rejected');
        },
        m => {
          expect(isRight(m)).to.equal(true);
          expect(m.value).to.equal(1);
          done();
        }
      );
    });

    it('returns a (Future _ (Left e)) from a (Future e _)', done => {
      const actual = P.attempt(Future.reject(1));
      actual.fork(
        _ => {
          throw Error('The Future should bot have rejected');
        },
        m => {
          expect(isLeft(m)).to.equal(true);
          expect(m.value).to.equal(1);
          done();
        }
      );
    });

  });

  describe('.ftap()', () => {

    it('returns a Function', () => {
      expect(P.ftap(noop)).to.be.a('function');
    });

    it('ensures the original argument is returned', done => {
      const spy = sinon.stub().returns(['foo']);
      const f = P.ftap(spy);
      f('bar').map(x => {
        expect(x).to.equal('bar');
        expect(spy).to.have.been.calledWith('bar');
        done();
        return null;
      });
    });

  });

  describe('.errorToString()', () => {

    it('should always return a String', () => {
      const values = [new Error, 'foo'];
      values.forEach(val => expect(P.errorToString(val)).to.be.a('string'));
    });

    it('should contain the error message', () => {
      expect(P.errorToString(error)).to.contain(error.message);
    });

  });

});


