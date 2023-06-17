const morgan = require('morgan');
const express = require('express');
const { httpLogger } = require('../utils/logger');

async function load(app, clientPaths) {
	app.set('views', clientPaths.views);
	app.set('view engine', 'pug');
	app.use(morgan('short', {stream: httpLogger.stream}));
	app.use(express.json());
	app.use(express.urlencoded({extended: false}));
	app.use(express.static(clientPaths.public));
}

module.exports = load;