'use strict';

const dispatch = require('../util/dispatch');
const permission = require('../util/permission');
const {json} = require('body-parser');

module.exports = router => {

  router.use(json({limit: '2mb'}));
  router.use(dispatch('auth/session'));

  router.get('/', permission('ping'), dispatch('index'));
  router.get('/auth', permission('auth.view'), dispatch('auth/index'));
  router.post('/auth', permission('auth.create'), dispatch('auth/create'));

};
