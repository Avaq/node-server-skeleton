'use strict';

const {Authorization} = require('../../domain/models');
const {refreshTokenPair} = require('./_util');
const validate = require('../../util/validate');
const Future = require('fluture');

module.exports = req => Future.do(function*() {

  const auth = yield validate(Authorization, req.body);

  const [token, refresh] = yield refreshTokenPair(
    req.services.token.encode,
    req.services.token.decode,
    auth.token,
    auth.refresh
  );

  return Authorization({token, refresh});

});
