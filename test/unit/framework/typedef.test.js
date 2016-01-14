import typedef from '../../../src/framework/typedef';
import t from 'tcomb';
import {validate} from 'tcomb-validation';

describe('Type definition framework', () => {

  describe('.typedef()', () => {

    let ShortString;

    before('create ShortString definition', () => {
      ShortString = typedef('ShortString', t.String, {
        'must not be empty': s => s.length < 1,
        'is too long': s => s.length > 3
      });
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
      expect(v.firstError().message).to.be.a('string');
    });

    it('gives the right error message based on predicates', () => {
      const empty = validate('', ShortString);
      const tooLong = validate('12345', ShortString);
      expect(empty.firstError().message).to.equal('The ShortString must not be empty');
      expect(tooLong.firstError().message).to.equal('The ShortString is too long');
    });

    //I know ShortBlob is an oxymoron, but it sounds so cute.
    it('cascades to supertype error messages', () => {
      const ShortBlob = typedef('ShortBlob', ShortString, {
        'is not binary': s => (/[01]*/).test(s)
      });
      const empty = validate('', ShortBlob);
      const hello = validate('hi', ShortBlob);
      expect(empty.firstError().message).to.equal('The ShortString must not be empty');
      expect(hello.firstError().message).to.equal('The ShortBlob is not binary');
    });

    it('gives the right error messages for structs', () => {

      const User = t.struct({
        name: ShortString
      }, 'User');

      const v = validate({name: '12345'}, User);

      expect(v.firstError().message).to.equal('The \'name\' is too long');

    });

  });

});
