'use strict';

const {Authentication, Authorization} = require('../../domain/models');
const {maybeToFuture} = require('../../util/future');
const {createTokenPair} = require('./_util');
const validate = require('../../util/validate');
const error = require('http-errors');
const Future = require('fluture');
const bcrypt = require('twin-bcrypt');
const {K} = require('sanctuary-env');

//    invalidCredentials :: NotAuthorizedError
const invalidCredentials = error(403, 'Invalid credentials');

//verify :: (String, String) -> Future Error True
const verify = (pass, hash) => Future((l, r) => {
  bcrypt.compare(pass, hash, ok => ok ? r(ok) : l(new Error('Passwords differ')));
});

module.exports = req => Future.do(function*() {

  const auth = yield validate(Authentication, req.body);

  const user =
    yield req.services.users.get(auth.username)
    .chain(maybeToFuture(invalidCredentials))
    .chainRej(Future.rejectAfter(400 + Math.round(Math.random() * 200)));

  yield verify(auth.password, user.password).mapRej(K(invalidCredentials));

  const [token, refresh] = yield createTokenPair(req.services.token.encode, user._id);

  return Authorization({token, refresh});

});
