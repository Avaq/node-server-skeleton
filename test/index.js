'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiThings = require('chai-things');

//Configure chai.
chai.use(sinonChai);
chai.use(chaiThings);

//Expose globals.
global.expect = chai.expect;
global.sinon = sinon;
