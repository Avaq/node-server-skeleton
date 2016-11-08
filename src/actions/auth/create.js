'use strict';

const {Authentication, Authorization} = require('../../domain/models');
const {maybeToFuture} = require('../../util/future');
const {createTokenPair} = require('../../util/auth');
const validate = require('../../util/validate');
const error = require('http-errors');
const Future = require('fluture');
const bcrypt = require('twin-bcrypt');
const {K, Just} = require('sanctuary');

//    invalidCredentials :: NotAuthorizedError
const invalidCredentials = error(403, 'Invalid credentials');

//verify :: (String, String) -> Future Error True
const verify = (pass, hash) => Future((l, r) => {
  bcrypt.compare(pass, hash, ok => ok ? r(ok) : l(new Error('Passwords differ')));
});

//TODO: Implement findUser
//    findUser :: String -> Future Error (Maybe User)
const findUser = username => Future.of(Just({id: 1, username, password: ''}));

module.exports = req => Future.do(function*() {
  const auth = yield validate(Authentication, req.body);
  const user = yield findUser(auth.username).chain(maybeToFuture(invalidCredentials));
  yield verify(auth.password, user.password).mapRej(K(invalidCredentials));
  const [token, refresh] = yield createTokenPair(req.services.token.encode, user.id);
  return Authorization({token, refresh});
});
