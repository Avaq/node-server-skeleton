'use strict';

const {Middleware} = require('momi');
const {concat} = require('../prelude');

//      putService :: String -> Any -> Middleware {services: Services} b ()
exports.putService = (x, service) => Middleware.modify(state => concat(state, {
  services: concat(state.services, {[x]: service})
}));

//      getService :: String -> Middleware {services: Services} b Any
exports.getService = x => Middleware.get.map(state => {
  const service = state.services[x];
  if(!service) {
    throw new Error(`The ${x} service has not been registerred`);
  }
  return service;
});
