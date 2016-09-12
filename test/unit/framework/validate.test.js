'use strict';

const validate = require('../../../src/util/validate');
const Future = require('fluture');
const {BadRequest} = require('http-errors');
const t = require('tcomb');

describe('Validation framework', () => {

  describe('.validate()', () => {

    it('returns a Future', () => {
      expect(validate(t.String, '')).to.be.an.instanceof(Future);
    });

    it('rejects with BadRequest error when given invalid input', done => {
      validate(t.String, {not: 'a string'}).fork(
        err => {
          expect(err).to.be.an.instanceof(BadRequest);
          done();
        },
        () => done(new Error('It did not reject'))
      );
    });

    it('resolves with the input value when valid', done => {
      validate(t.String, 'a string').fork(done, v => {
        expect(v).to.equal('a string');
        done();
      });
    });

  });

});
