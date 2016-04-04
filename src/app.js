'use strict';

import server from './services/http';
import router from './framework/route';

//Set up.
const route = router(server);
server.set('x-powered-by', false);

//Load routes, order is important.
route('common');
route('app');

//The error handling routes need to be attached to the "root" router.
require('./routes/error').default(server);

//Export the server for binding.
export default server;
