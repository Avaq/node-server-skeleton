'use strict';

const {Authentication, Authorization} = require('../../domain/models');
const validate = require('../../util/validate');
const error = require('http-errors');
const Future = require('fluture');
const bcrypt = require('bcrypt');
const {K, prop, get, fromMaybe, pipe, maybeToFuture, chain, is} = require('../../prelude');

//    invalidCredentials :: UnauthorizedError
const invalidCredentials = error(401, 'Invalid credentials');

//verify :: (String, String) -> Future Error True
const verify = (pass, hash) => Future.node(done => bcrypt.compare(pass, hash, done));

module.exports = (req, res) => Future.do(function*() {

  //    findUserByName :: UserId -> Future UnauthorizedError User
  const findUserByName = pipe([
    req.services.users.get,
    chain(maybeToFuture(invalidCredentials))
  ]);

  const auth = yield validate(Authentication, req.body);
  const user = yield findUserByName(auth.username);
  yield verify(auth.password, user.password)
  .chain(ok => ok ? Future.of(ok) : Future.reject(invalidCredentials))
  .mapRej(K(invalidCredentials));

  const [token, refresh] = yield req.services.auth.createTokenPair({
    user: prop('username', user),
    groups: fromMaybe([], get(is(Array), 'groups', user))
  });

  res.cookie('token', token, {
    path: '/',
    maxAge: yield req.services.config('security.tokenLife')
  });

  return Authorization({token, refresh});

});
