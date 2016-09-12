'use strict';

const dispatch = require('../util/dispatch');
const {json} = require('body-parser');

module.exports = router => {

  router.use(json({limit: '2mb'}));

  router.get('/', dispatch('index'));

};
