'use strict';

const {Authentication, Authorization} = require('../../domain/models');
const {maybeToFuture} = require('../../util/future');
const {createTokenPair} = require('./_util');
const validate = require('../../util/validate');
const error = require('http-errors');
const Future = require('fluture');
const bcrypt = require('bcrypt');
const {K, prop, get, fromMaybe, pipe} = require('sanctuary-env');
const {chain} = require('ramda');

//    invalidCredentials :: NotAuthorizedError
const invalidCredentials = error(401, 'Invalid credentials');

//verify :: (String, String) -> Future Error True
const verify = (pass, hash) => Future.node(done => bcrypt.compare(pass, hash, done));

module.exports = (req, res) => Future.do(function*() {

  //    findUserByName :: UserId -> Future NotAuthorizedError User
  const findUserByName = pipe([
    req.services.users.get,
    chain(maybeToFuture(invalidCredentials))
  ]);

  const auth = yield validate(Authentication, req.body);
  const user = yield findUserByName(auth.username);
  yield verify(auth.password, user.password).mapRej(K(invalidCredentials));

  const [token, refresh] = yield createTokenPair(req.services.token.encode, {
    user: prop('username', user),
    groups: fromMaybe([], get(Array, 'groups', user))
  });

  res.cookie('token', token, {
    path: '/',
    maxAge: yield req.services.config('security.tokenLife')
  });

  return Authorization({token, refresh});

});
