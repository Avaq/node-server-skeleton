import * as util from '../../../src/util/future';
import {Future} from 'ramda-fantasy';
import {Just, Nothing, Left, Right} from 'sanctuary';

const error = new Error('It broke');
const noop = x => x;
const returns = () => 'It worked';
const throws = () => {
  throw error;
};
const nodeCallbackRes = f => f(null, 'It worked');
const nodeCallbackErr = f => f(error);

describe('Future utililities', () => {

  describe('.wrapNode()', () => {

    it('should return a function that returns a task', () => {
      const f = util.wrapNode(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('s Future should call the input function when forked', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(spy);
      f('test').fork(noop, noop);
      expect(spy).to.have.been.calledWith('test');
    });

    it('s Future should reject with a node-style error', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(nodeCallbackErr);
      f().fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

    it('s Future should resolve with a node-style result', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(nodeCallbackRes);
      f().fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

  });

  describe('.wrapTry()', () => {

    it('should return a function that returns a task', () => {
      const f = util.wrapTry(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('s Future should call the input function when forked', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(spy);
      f('test').fork(noop, noop);
      expect(spy).to.have.been.calledWith('test');
    });

    it('s Future should reject with a thrown error', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(throws);
      f().fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

    it('s Future should resolve with a returned result', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(returns);
      f().fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

  });

  describe('.maybeToFuture()', () => {

    it('should return a resolved Future from a Just', () => {
      const spy = sinon.spy();
      const future = util.maybeToFuture(error, Just('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('should return a rejected Future from a Nothing', () => {
      const spy = sinon.spy();
      const future = util.maybeToFuture(error, Nothing());
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

  describe('.eitherToFuture()', () => {

    it('should return a resolved Future from a Right', () => {
      const spy = sinon.spy();
      const future = util.eitherToFuture(Right('It worked'));
      expect(future).to.be.an.instanceof(Future);
      future.fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

    it('should return a rejected Future from a Left', () => {
      const spy = sinon.spy();
      const future = util.eitherToFuture(Left(error));
      expect(future).to.be.an.instanceof(Future);
      future.fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

  });

});
