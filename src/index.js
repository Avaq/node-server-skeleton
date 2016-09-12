'use strict';

const server = require('./services/http');
const router = require('./util/route');

//Set up.
const route = router(server);
server.set('x-powered-by', false);

//Load routes, order is important.
route('common');
route('preconditions');
route('services');
route('app');

//The error handling routes need to be attached to the "root" router.
require('./routes/error')(server);

//Export the server for binding.
module.exports = server;
