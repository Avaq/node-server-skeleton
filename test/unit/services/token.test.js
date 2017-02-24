'use strict';

const {encode, decode, encodeToken} = require('../../../src/services/token');
const {chain} = require('../../../src/prelude');

describe('Token service', () => {

  const secret = 'suchsecret';
  const data = {such: 'data'};

  describe('.encode()', () => {

    it('is a curried binary function', () => {
      expect(encode.length).to.equal(2);
      expect(encode('suchsecret')).to.be.a('function');
    });

    it('returns an Either String', () => {
      const decoded = encode(secret, data);
      expect(decoded.isRight).to.equal(true);
      expect(decoded.value).to.be.a('string');
    });

  });

  describe('.decode()', () => {

    const encoded = encode(secret, data);

    it('is a curried binary function', () => {
      expect(decode.length).to.equal(2);
      expect(decode('suchsecret')).to.be.a('function');
    });

    it('fails to decode with the wrong secret', () => {
      const decoded = chain(decode('notsecret'), encoded);
      expect(decoded.isLeft).to.equal(true);
    });

    it('fails to decode with a wrong format', () => {
      [{}, {d: {}}, {v: 1}, {v: '', d: {}}, {v: 1, d: ''}].forEach(invalid => {
        const encoded = encodeToken(secret, invalid);
        const decoded = chain(decode(secret), encoded);
        expect(decoded.isLeft).to.equal(true);
      });
    });

    it('fails to decode with the wrong version', () => {
      const encoded = encodeToken(secret, {v: -1, d: data});
      const decoded = chain(decode(secret), encoded);
      expect(decoded.isLeft).to.equal(true);
    });

    it('returns an Either of the encoded data', () => {
      const decoded = chain(decode(secret), encoded);
      expect(decoded.isRight).to.equal(true);
      expect(decoded.value).to.deep.equal(data);
    });

  });

});
