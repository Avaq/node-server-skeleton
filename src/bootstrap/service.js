'use strict';

const {Middleware} = require('momi');
const {K} = require('sanctuary-env');

//    Services :: StrMap String Any
const Services = () => ({});

//This bootstrapper prepares the state to be used by the functions in ./util.
//     default :: Middleware a b c -> Middleware {services: Services} b c
module.exports = next => Middleware.put({services: Services()}).chain(K(next));
