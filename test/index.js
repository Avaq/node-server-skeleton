'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiThings = require('chai-things');
const Mocha = require('mocha');
const path = require('path');
const glob = require('glob');

//Configure chai.
chai.use(sinonChai);
chai.use(chaiThings);

//Expose globals.
global.expect = chai.expect;
global.sinon = sinon;

//Set up Mocha.
const mocha = new Mocha;
mocha.ui('bdd');
mocha.reporter('spec');
mocha.checkLeaks();
mocha.fullTrace();
mocha.globals(['expect', 'sinon']);

//Try to run tests.
try{

  //Add files to mocha.
  const root = path.resolve(process.cwd(), process.argv[2] || 'test');
  glob.sync('**/*.test.js', {cwd: root})
  .forEach(name => mocha.addFile(path.join(root, name)));

  //Execute the runner.
  mocha.run(failures => {
    if(failures > 0) {
      process.exit(failures);
    }
  });

} catch(err) {
  process.stderr.write(err.stack || err.toString());
  process.exit(1);
}
