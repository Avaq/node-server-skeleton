'use strict';

const express = require('express');
const {App, Middleware} = require('momi');
const router = require('../util/route');
const setupErrorHandling = require('../routes/error');
const {putService} = require('../util/service');

module.exports = App.do(function*(next) {

  const app = express();
  const {services} = yield Middleware.get;

  //Nothing powers our applications.
  app.set('x-powered-by', false);

  //Attach services to every request object.
  app.use((req, res, next) => {
    req.services = services;
    next();
  });

  //Load routes. Order is important.
  const loadRoutes = router(app);
  loadRoutes('common');
  loadRoutes('preconditions');
  loadRoutes('app');
  setupErrorHandling(app);

  //Attach the app as a service.
  yield putService('app', app);

  return yield next;

});
