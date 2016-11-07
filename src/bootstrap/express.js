'use strict';

const express = require('express');

module.exports = consume => {
  const app = express();
  app.set('x-powered-by', false);
  return consume(app);
};
