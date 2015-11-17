import typedef from '../../../src/framework/typedef';
import t from 'tcomb';
import {validate} from 'tcomb-validation';

describe('Type definition framework', () => {

  describe('.typedef()', () => {

    let ShortString;

    before('create ShortString definition', () => {
      ShortString = typedef(
        t.String,
        s => s.length > 3 ? 'Too long!' : '',
        'ShortString'
      );
    })

    it('is a function', () => {
      expect(ShortString).to.be.a('function');
    });

    it('throws when invalid', () => {
      expect(() => ShortString('12345')).to.throw(TypeError);
    });

    it('returns input when valid', () => {
      expect(ShortString('123')).to.equal('123');
    });

    it('allows tcomb-validation to get at the error message', () => {
      const v = validate('12345', ShortString);
      expect(v).to.have.property('errors');
      expect(v.errors).to.be.an('array');
      expect(v.firstError()).to.have.property('message');
      expect(v.firstError().message).to.equal('Too long!');
    });

  });

});
