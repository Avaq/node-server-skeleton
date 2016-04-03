import * as util from '../../../src/util/common';
import {view, set} from 'ramda';

const error = new Error('It broke');
const noop = x => x;

describe('Common utililities', () => {

  describe('.getErrorString()', () => {

    it('should always return a String', () => {
      const values = [new Error, {}, [], 'foo', noop, 1, undefined, NaN, null, true, false];
      values.forEach(val => expect(util.getErrorString(val)).to.be.a('string'));
    });

    it('should contain the error message', () => {
      expect(util.getErrorString(error)).to.contain(error.message);
    });

  });

  describe('.inspect()', () => {

    it('should always return a String', () => {
      const values = [new Error, {}, [], 'foo', noop, 1, undefined, NaN, null, true, false];
      values.forEach(val => expect(util.inspect({}, val)).to.be.a('string'));
    });

  });

  describe('.lensPath()', () => {

    const testObject = {
      foo: {
        bar: {
          nyerk: 'snarl'
        }
      }
    };

    it('should return a value usable with R.view', () => {
      const nyerkLens = util.lensPath(['foo', 'bar', 'nyerk']);
      expect(view(nyerkLens, testObject)).to.equal('snarl');
    });

    it('should return a value usable with R.set', () => {
      const nyerkLens = util.lensPath(['foo', 'bar', 'nyerk']);
      const expected = {foo: {bar: {nyerk: 'baz'}}}
      expect(set(nyerkLens, 'baz', testObject)).to.deep.equal(expected);
    });

  });

  describe('.appendUniq()', () => {

    it('should append new values', () => {
      expect(util.appendUniq('bar', ['foo'])).to.deep.equal(['foo', 'bar']);
    });

    it('should not append existing values', () => {
      expect(util.appendUniq('foo', ['foo'])).to.deep.equal(['foo']);
    });

  });

  describe('.indexBy()', () => {

    it('should create an index', () => {
      const list = [{foo: 'bar'}, {foo: 'baz'}];
      const expected = {bar: {foo: 'bar'}, baz: {foo: 'baz'}};
      const actual = util.indexBy('foo', list);
      expect(actual).to.deep.equal(expected);
    });

  });

  describe('.filterObject()', () => {

    it('should call the filterer with value and key', () => {
      const filterer = sinon.stub().returns(true);
      const object = {a: 1};
      util.filterObject(filterer, object);
      expect(filterer).to.have.been.calledWith(1, 'a');
    });

    it('should remove values for which the filterer returned false', () => {
      const filterer = v => v > 1;
      const object = {a: 1, b: 2, c: 3, z: 0};
      const expected = {b: 2, c: 3};
      const actual = util.filterObject(filterer, object);
      expect(actual).to.deep.equal(expected);
    });

  });

  describe('.now()', () => {

    it('should return a Date', () => {
      expect(util.now()).to.be.an.instanceof(Date);
    });

    it('should contain the current time, ignoring input', () => {
      const now = Date.now();
      expect(util.now(0).getTime()).to.be.within(now - 100, now + 100);
    });

  });

  describe('.date()', () => {

    it('should always return a Date', () => {
      const values = [new Error, {}, [], 'foo', noop, 1, undefined, NaN, null, true, false];
      values.forEach(val => expect(util.date(val)).to.be.an.instanceof(Date));
    });

  });

  describe('.line()', () => {

    it('should apply the proper string conversions', () => {

      const tests = {
        'foo bar baz': util.line `
          foo
          bar
          baz
        `,
        'nyerk snarl': util.line `
        nyerk


        snarl`
      };

      Object.keys(tests).forEach(expected => {
        const actual = tests[expected];
        expect(actual).to.equal(expected);
      });

    });

  });

  describe('.ftap()', () => {

    it('returns a function', () => {
      expect(util.ftap(noop)).to.be.a('function');
    });

    it('ensures the original argument is returned', done => {
      const spy = sinon.stub().returns(['foo']);
      const f = util.ftap(spy);
      f('bar').map(x => (
        expect(x).to.equal('bar'),
        expect(spy).to.have.been.calledWith('bar'),
        done()
      ));
    });

  });

});
