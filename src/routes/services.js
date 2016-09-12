'use strict';

const services = require('../services');

module.exports = router => router.use((req, res, next) => {
  req.services = services;
  next();
});
