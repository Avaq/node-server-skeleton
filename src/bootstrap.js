'use strict';

const {App} = require('momi');

module.exports = App.empty()
.use(require('./bootstrap/service'))
.use(require('./bootstrap/config'))
.use(require('./bootstrap/token'))
.use(require('./bootstrap/auth'))
.use(require('./bootstrap/users'))
.use(require('./bootstrap/app'));
