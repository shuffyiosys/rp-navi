const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const mongoSantiize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { generateKey } = require('../utils/crypto')

async function load (app, config) {
	/* Setup variables to use in the various middleware that needs it. */
	const SCRIPT_RULES = [
		'strict-dynamic', 
		function(req, res){ return `'nonce-${res.locals.scriptNonce}'`}, 
	]
	const STYLE_RULES = [
		"'self'", 
		function(req, res){ return `'nonce-${res.locals.styleNonce}'`}, 
		"'unsafe-inline'", 
		'http:', 
		'https:'
	]
	const  limiter = rateLimit({
		windowMs: config.rateLimiter.timeoutMs,
		max: config.rateLimiter.maxReq
	});

	app.use(function(req, res, next) {
		res.locals.styleNonce = generateKey();
		res.locals.scriptNonce = generateKey();
		next()
	});
	app.use(helmet());
	app.use(helmet.contentSecurityPolicy({
		useDefaults: true,
		directives: {
			scriptSrc: SCRIPT_RULES,
			styleSrc: STYLE_RULES,
		}
	}));
	app.use(xssClean());
	app.use(hpp());
	app.use(mongoSantiize());
	app.use(limiter);
}

module.exports = load;