'use strict';
import express from 'express';
const server = express();
server.set('x-powered-by', false);
export default server;
