'use strict';

const util = require('../../../src/util/template');

describe('Templating functions', () => {

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

});
