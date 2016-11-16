'use strict';

const {T, Just} = require('sanctuary-env');
const Future = require('fluture');
const bcrypt = require('bcrypt');
const {User} = require('../domain/models');

//TODO: This is a mock service which loads a user by username. It must be replaced.
module.exports = T({
  get: username =>
    Future.node(done => bcrypt.hash('password123', 10, done))
    .map(password => ({username, password, groups: []}))
    .map(User)
    .map(Just)
});
