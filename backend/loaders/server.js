const createError = require("http-errors");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");
const { PageRenderParams } = require("../classes/page-render-params");

async function createServers(app, config) {
	// Setup error handlers
	app.use(handleError404);
	app.use(handleErrors);

	let servers = {
		httpServer: http.createServer(app),
		httpsServer: null,
	};

	/* Create HTTPS server */
	if (config.TLS_CERT_FILENAME && config.TLS_KEY_FILENAME) {
		servers = startHttpsServer(app, config);
	}

	return servers;
}

function startHttpsServer(app, config) {
	let servers = {
		httpServer: http.createServer(app),
		httpsServer: null,
	};
	const certFilename = path.join(config.TLS_FILES_PATH, config.TLS_CERT_FILENAME);
	const keyFilename = path.join(config.TLS_FILES_PATH, config.TLS_KEY_FILENAME);
	logger.debug(`Using cert file ${certFilename}, key file ${keyFilename}`);

	const keyFileExists = fs.existsSync(keyFilename);
	const certFileExists = fs.existsSync(certFilename);
	if (keyFileExists === false || certFileExists === false) {
		return servers;
	}

	let options = {
		key: fs.readFileSync(keyFilename),
		cert: fs.readFileSync(certFilename),
	};
	servers.httpsServer = https.createServer(options, app);

	return servers;
}

function startServers(servers, config, type = "http") {
	let httpServer = servers.httpServer;
	let httpsServer = servers.httpsServer;

	if (type == "https") {
		const port = config.HTTPS_PORT;
		logger.info(`Starting ${type} server at port ${port}`);
		httpsServer.listen(port, () => onListening(httpsServer));
		httpsServer.on("error", (error) => onError(error, port));

		// Create HTTP server to redirect requests to HTTPS
		logger.info(`Starting http redirect server at port ${config.httpPort}`);
		httpServer = http.createServer(redirectRequests).listen(config.httpPort);
	} else {
		const port = config.HTTP_PORT;
		logger.info(`Starting ${type} server at port ${port}`);
		httpServer.listen(port, () => onListening(httpServer));
		httpServer.on("error", (error) => onError(error, port));
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
	let addr = server.address();
	let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	logger.debug("Listening on " + bind);
}

function onError(error, port) {
	if (error.syscall !== "listen") {
		throw error;
	}

	let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
		default:
			throw error;
	}
}

function handleError404(req, res, next) {
	res.status(404);
	if (process.env.NODE_ENV === "development") {
		logger.info(`Client tried to access: ${req.url}`);
		next(createError(404));
	} else {
		const data = new PageRenderParams("Page not found", req.session, res.locals);
		next(res.render("404", data));
	}
}

function handleErrors(err, req, res, next) {
	logger.error(`The server ran into a problem: ${err.stack || err}`);

	// Show error on web page if in a development environment.
	if (req.app.get("env") === "development") {
		res.locals.message = err.message;
		res.locals.error = err;
	} else {
		res.locals.message = "The server encountered a problem 🙁";
		res.locals.error = {};
	}
	logger.error(`${err.message}\n${err.stack}`);

	// render the error page
	res.status(err.status || 500);
	let data = new PageRenderParams("Website error", req.session, res.locals);
	data.message = res.locals.message;
	data.error = res.locals.error;
	res.render("error", data);
}

function redirectRequests(req, res) {
	let hostname = req.headers.host;
	if (portIdx > -1) {
		hostname = req.headers.host.substring(0, portIdx);
	}
	res.writeHead(301, {
		location: `https://${hostname}:${config.httpsPort}${req.url}`,
	});
	res.end();
}

module.exports = {
	createServers,
	startServers,
};
