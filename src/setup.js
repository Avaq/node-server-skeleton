'use strict';

/*eslint max-nested-callbacks: 0*/

const bootstrap = require('./util/bootstrap');
const router = require('./util/route');
const setupErrorHandling = require('./routes/error');

module.exports = cont =>
bootstrap('token', token =>
bootstrap('cache', cache =>
bootstrap('express', app => {

  //Attach services to every request object.
  app.use((req, res, next) => {
    req.services = {token, cache};
    next();
  });

  //Load routes. Order is important.
  const loadRoutes = router(app);
  loadRoutes('common');
  loadRoutes('preconditions');
  loadRoutes('app');
  setupErrorHandling(app);

  return cont({token, cache, app});

})));
