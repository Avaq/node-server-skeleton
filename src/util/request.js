'use strict';

const request = require('request');
const Future = require('fluture');

module.exports = o => Future((l, r) => {
  const socket = request(o, (err, res) => err ? l(err) : r(res));
  return () => socket.abort();
});
