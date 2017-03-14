'use strict';

const createTokenService = require('../../../src/services/token');
const {chain} = require('../../../src/prelude');

describe('Token service', () => {

  const secret = 'suchsecret';
  const data = {such: 'data'};
  const {encode, decode, encodeToken} = createTokenService(secret);

  describe('.encode()', () => {

    it('returns an Either String', () => {
      const decoded = encode(data);
      expect(decoded.isRight).to.equal(true);
      expect(decoded.value).to.be.a('string');
    });

  });

  describe('.decode()', () => {

    const encoded = encode(data);

    it('fails to decode with the wrong secret', () => {
      const decoded = chain(createTokenService('notsecret').decode, encoded);
      expect(decoded.isLeft).to.equal(true);
    });

    it('fails to decode with a wrong format', () => {
      [{}, {d: {}}, {v: 1}, {v: '', d: {}}, {v: 1, d: ''}].forEach(invalid => {
        const encoded = encodeToken(invalid);
        const decoded = chain(decode, encoded);
        expect(decoded.isLeft).to.equal(true);
      });
    });

    it('fails to decode with the wrong version', () => {
      const encoded = encodeToken({v: -1, d: data});
      const decoded = chain(decode, encoded);
      expect(decoded.isLeft).to.equal(true);
    });

    it('returns an Either of the encoded data', () => {
      const decoded = chain(decode, encoded);
      expect(decoded.isRight).to.equal(true);
      expect(decoded.value).to.deep.equal(data);
    });

  });

});
