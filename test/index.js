/*eslint complexity:0*/
'use strict';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import promiseChai from 'chai-as-promised';
import Promise from 'bluebird';
import Mocha from 'mocha';
import path from 'path';
import glob from 'glob';

//Configure chai.
chai.use(sinonChai);
chai.use(promiseChai);

//Expose globals.
global.expect = expect;
global.sinon = sinon;
global.Promise = Promise;

//Set up Bluebird.
Promise.longStackTraces();

//Set up Mocha.
const mocha = new Mocha;
mocha.ui('bdd');
mocha.reporter('spec');
mocha.checkLeaks();
mocha.fullTrace();
mocha.globals(['expect', 'sinon']);

//Rejections per test.
let rejections = null;

//Store unhandled rejections.
Promise.onPossiblyUnhandledRejection((err, promise) => {

  //Just throw the error if we're not keeping track of rejections.
  if(!rejections){
    throw err;
  }

  //Otherwise, store the rejection.
  rejections.set(promise, err);

});

//Remove eventually handled rejections.
Promise.onUnhandledRejectionHandled((promise) => rejections.delete(promise));

//Try to run tests.
try{

  //Add files to mocha.
  const root = path.resolve(process.cwd(), process.argv[2] || 'test');
  glob.sync('**/*.test.js', {cwd: root})
  .forEach(name => mocha.addFile(path.join(root, name)));

  //Execute the runner.
  const runner = mocha.run(failures => {
    if(failures > 0){
      process.exit(failures);
    }
  });

  //When a test starts, create a new map for its possible rejections.
  runner.on('test', () => rejections = new Map);

  //When the test ends, check if there are rejections left and fail the test if there are.
  runner.on('test end', () => {

    //Try to check for unahandled rejections and fail the test if there are any.
    try{

      //No rejections? All done.
      if(!(rejections && rejections.size > 0)){
        return (rejections = null);
      }

      //Collect error messages.
      const messages = [];

      //For every rejection, grab the error and store its message.
      for(const err of rejections.values()){
        messages.push(err.stack || err.toString());
      }

      //Clear rejections.
      rejections = null;

      //Fail the test with unhandled rejections.
      process.stderr.write(
        `Finished with unhandled rejections. Fix your async fork!\n\n${messages.join('\n\n')}\n\n`
      );

      //Exit the process.
      process.exit(1);

    }

    //Let someone know that we couldn't handle the rejections.
    catch(err){
      process.stderr.write(`Failed to handle rejections: ${err.stack || err.toString()}\n`);
    }

  });

}

//Catch any error, usually module related.
catch(err){
  process.stderr.write(err.stack || err.toString());
  process.exit(1);
}
