'use strict';

const Future = require('fluture');
const {Middleware} = require('momi');

exports.race = (ma, mb) => Middleware(s => Future.race(ma.run(s), mb.run(s)));
