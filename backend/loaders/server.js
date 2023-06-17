const createError = require('http-errors');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');
const { RenderData } = require('../utils/render-data');

function load(app, config) {
	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		res.status(404);
		if(process.env.NODE_ENV === 'development') {
			next(createError(404));
		}
		else {
			const data = new RenderData('Page not found', req.session, res.locals);
			next(res.render('404', data));
		}
	})

	// error handler
	app.use(function (err, req, res, next) {
		//logger.error(`The server ran into a problem: ${err.stack || err}`)
		// Show error on web page if in a development environment.
		if (req.app.get('env') === 'development') {
			res.locals.message =  err.message 
			res.locals.error = err
		}
		else {
			res.locals.message = "The server encountered a problem 🙁"
			res.locals.error = {}
		}
		logger.error(`${err.message}\n${err.stack}`);
		
		// render the error page
		res.status(err.status || 500)
		let data = new RenderData('Website error', req.session, res.locals);
		data.message = res.locals.message;
		data.error = res.locals.error;
		res.render('error', data);
	})

	/* Create and start server ***************************************************/
	if (config.certs.certFile && config.certs.keyFile) {
		
		let server = http.createServer(app);
		const certFilename = path.join(__dirname, '..', config.certs.path, config.certs.certFile);
		const keyFilename = path.join(__dirname, '..', config.certs.path, config.certs.keyFile);
		logger.debug(`Using cert file ${certFilename}, key file ${keyFilename}`);
		if (fs.existsSync(keyFilename) && fs.existsSync(certFilename)) 
		{
			let options = { 
				key: fs.readFileSync(keyFilename),
				cert: fs.readFileSync(certFilename)
			};
			server = https.createServer(options, app);
			logger.info('Starting https server at port ' + config.httpsPort);
			logger.info('Starting http server at port ' + config.httpPort);
			server.listen(config.httpsPort, () => {
				logger.info('server started.');
				onListening(server);
			});
			server.on('error', (error) => {onError(error, config.httpsPort)});

			// Create HTTP server to redirect requests to HTTPS
			http.createServer((req, res) => {
				const portIdx = req.headers.host.indexOf(':');
				let hostname = req.headers.host;
				if( portIdx > -1) {
					hostname = req.headers.host.substring(0, portIdx);
				}
				res.writeHead(301, {
					location:`https://${hostname}:${config.httpsPort}${req.url}`
				})
				res.end();
			}).listen(config.httpPort);
		}
		// HTTP only fallback
		else {
			logger.warn(`THIS SERVER IS BEING RUN IN HTTP ONLY MODE`);
			startHttpServer(server, config.httpPort);
		}
	}
	else {
		let server = http.createServer(app);
		startHttpServer(server, config.httpPort);
	}
}



function startHttpServer(server, port) {
	logger.info('Starting http server at port ' + port);
	server.listen(port, () => {
		logger.info('server started.')
		onListening(server);
	});
	server.on('error', (error) => {onError(error, port)});
}

function onError(error, port) {
	if (error.syscall !== 'listen') { throw error; }

	let bind = typeof port === 'string'	? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	logger.debug('Listening on ' + bind);
}

module.exports = load;