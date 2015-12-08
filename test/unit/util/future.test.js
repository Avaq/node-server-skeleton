import * as util from '../../../src/util/future';
import {Future} from 'ramda-fantasy';
import {Just, Nothing, Left, Right} from 'sanctuary';
import Promise from 'bluebird';

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

    it('returns a function that returns a Future', () => {
      const f = util.wrapNode(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('s Future calls the input function when forked', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(spy);
      f('test').fork(noop, noop);
      expect(spy).to.have.been.calledWith('test');
    });

    it('s Future rejects with a node-style error', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(nodeCallbackErr);
      f().fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

    it('s Future resolves with a node-style result', () => {
      const spy = sinon.spy();
      const f = util.wrapNode(nodeCallbackRes);
      f().fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

  });

  describe('.wrapTry()', () => {

    it('returns a function that returns a task', () => {
      const f = util.wrapTry(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('s Future calls the input function when forked', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(spy);
      f('test').fork(noop, noop);
      expect(spy).to.have.been.calledWith('test');
    });

    it('s Future rejects with a thrown error', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(throws);
      f().fork(spy, noop);
      expect(spy).to.have.been.calledWith(error);
    });

    it('s Future resolves with a returned result', () => {
      const spy = sinon.spy();
      const f = util.wrapTry(returns);
      f().fork(noop, spy);
      expect(spy).to.have.been.calledWith('It worked');
    });

  });

  describe('.wrapPromise()', () => {

    it('returns a function that returns a Future', () => {
      const f = util.wrapPromise(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('forks a resolved Promise into the success branch', done => {
      const f = util.wrapPromise(() => Promise.resolve('a'));
      f().fork(done, v => {
        expect(v).to.equal('a');
        done();
      });
    });

    it('forks a rejected Promise into the failure branch', done => {
      const f = util.wrapPromise(() => Promise.reject(error));
      f().fork(
        err => (expect(err).to.equal(error), done()),
        () => done(new Error('It did not reject'))
      );
    });

    it('passes along arguments to the wrapped function', () => {
      const spy = sinon.stub().returns(Promise.resolve());
      const f = util.wrapPromise(spy);
      f('a', 'b').fork(noop, noop);
      expect(spy).to.have.been.calledWith('a', 'b');
    });

  });

  describe('.fromNode()', () => {

    it('returns a Future', () => {
      expect(util.fromNode(noop)).to.be.an.instanceof(Future);
    });

    it('calls the function with a callback once forked', () => {
      const spy = sinon.spy();
      util.fromNode(spy).fork(noop, noop);
      expect(spy).to.have.been.calledWith(sinon.match.func);
    });

    it('s Future resolves once the callback is called with (null, a)', done => {
      const f = done => done(null, 'a');
      util.fromNode(f).fork(done, v => (expect(v).to.equal('a'), done()));
    });

    it('s Future reject once the callback is called with (err)', done => {
      const f = done => done(error);
      util.fromNode(f).fork(
        err => (expect(err).to.equal(error), done()),
        () => done(new Error('It did not reject'))
      );
    });

  });

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

  describe('.after()', () => {

    it('returns a Future', () => {
      expect(util.after(20, 'a')).to.be.an.instanceof(Future);
    });

    it('resolves after n with a', function(done){
      this.timeout(30);
      const spy = sinon.spy();
      util.after(20, 'a').fork(noop, spy);
      setTimeout(() => (expect(spy).to.have.been.calledWith('a'), done()), 25);
      expect(spy).to.not.have.been.called;
    });

  });

  describe('.fork()', () => {

    it('returns a Future', () => {
      expect(util.fork(noop, noop, noop, 1)).to.be.an.instanceof(Future);
    });

    it('rejects when the predicate fails', done => {
      const f = sinon.stub().returns(false);
      const g = sinon.stub().returns(error);
      util.fork(f, g, noop, 1).fork(
        err => (expect(err).to.equal(error), done()),
        () => done(new Error('It did not reject'))
      );
    });

    it('resolves when the predicate succeeds', done => {
      const f = sinon.stub().returns(true);
      util.fork(f, noop, noop, 1).fork(done, v => (expect(v).to.equal(1), done()));
    });

  });

  describe('.race()', () => {

    it('returns a Future', () => {
      expect(util.race(noop, noop)).to.be.an.instanceof(Future);
    });

    it('rejects when the first one rejects', done => {
      const m1 = Future((rej, res) => setTimeout(res, 15, 1));
      const m2 = Future(rej => setTimeout(rej, 5, error));
      util.race(m1, m2).fork(
        err => (expect(err).to.equal(error), done()),
        () => done(new Error('It did not reject'))
      )
    });

    it('rejects when the first one resolves', done => {
      const m1 = Future((rej, res) => setTimeout(res, 5, 1));
      const m2 = Future(rej => setTimeout(rej, 15, error));
      util.race(m1, m2).fork(done, v => (expect(v).to.equal(1), done()));
    });

  });

});
