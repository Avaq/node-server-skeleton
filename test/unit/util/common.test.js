import * as util from '../../../src/util/common';
import {add, view, set} from 'ramda';

const error = new Error('It broke');
const noop = x => x;

describe('Common utililities', () => {

  describe('.createObject()', () => {

    it('should create an object', () => {
      const expected = {a: 1, b: 2, c: 3};
      const actual = util.createObject({a: noop, b: add(1), c: add(2)}, 1);
      expect(actual).to.deep.equal(expected);
    });

  });

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

});
