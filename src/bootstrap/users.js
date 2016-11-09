'use strict';

const {T, Just} = require('sanctuary-env');
const Future = require('fluture');
const bcrypt = require('twin-bcrypt');
const {User} = require('../domain/models');

//TODO: This is a mock service which loads a user by username. It must be replaced.
module.exports = T({
  get: username =>
    Future((rej, res) => bcrypt.hash('password123', bcrypt.genSalt(10), res))
    .map(password => ({username, password, groups: []}))
    .map(User)
    .map(Just)
});
