'use strict';

import server from './services/http';
import route from './framework/route';

//Set up.
server.set('x-powered-by', false);

//Load routes, order is important.
route('common');
route('app');
route('error');

//Export the server for binding.
export default server;
