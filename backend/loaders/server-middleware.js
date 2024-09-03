const morgan = require('morgan');
const express = require('express');
const favicon = require('serve-favicon');
const { httpLogger } = require('../utils/logger');

async function load(app, clientPaths) {
	app.set('views', clientPaths.views);
	app.set('view engine', 'pug');
	app.use(morgan('short', { stream: httpLogger.stream }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(clientPaths.public));
	app.use(favicon('../client/public/img/favicon.ico'));
}

module.exports = load;