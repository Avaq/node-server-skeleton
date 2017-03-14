'use strict';

const Future = require('fluture');
const bcrypt = require('bcrypt');
const {User} = require('../domain/models');
const {putService} = require('../util/service');
const {K, Just} = require('../prelude');

const getUserByUsername = username =>
  Future.node(done => bcrypt.hash('password123', 10, done))
  .map(password => ({username, password, groups: []}))
  .map(User)
  .map(Just);

//TODO: This attaches a mock service which loads a user by username. It must be replaced.
module.exports = next => putService('users', {get: getUserByUsername}).chain(K(next));
