const path = require('path');

function getConfig(fileName='.env') {
	require('dotenv').config({ path: path.join(__dirname, fileName) });
	let config = {
		environment: process.env.NODE_ENV || 'production',
		httpPort: process.env.PORT || 3000,
		httpsPort: process.env.HTTPS_PORT || 3001,
		database: {
			mongo: {
				url: process.env.MONGO_DB_IP || 'localhost',
				port: process.env.MONGO_DB_PORT || 27017,
				name:  process.env.MONGO_DB_NAME || 'test',
				username: process.env.MONGO_DB_USERNAME || '',
				password: process.env.MONGO_DB_PASSWORD || ''
			},
			redis: {
				url: process.env.REDIS_DB_IP || 'localhost',
				port: process.env.REDIS_DB_PORT || 6379,
				username: process.env.REDIS_DB_USERNAME || '',
				password: process.env.REDIS_DB_PASSWORD || ''
			}
		},
		certs: {
			path: process.env.TLS_FILES_PATH || '',
			certFile: process.env.TLS_CERT_FILENAME || '',
			keyFile: process.env.TLS_KEY_FILENAME || ''

		},
		session: {
			type: process.env.SESSION_TYPE || 'default',
			name: process.env.SESSION_NAME || 'CHANGEME',
			secret: process.env.SESSION_SECRET || 'CHANGEME',
			cookieSecret: process.env.SESSION_COOKIE_SECRET || 'CHANGEME',
			ttl: process.env.SESSION_TTL || (365 * 24 * 60 * 1000),
		},
		rateLimiter: {
			limitMs: process.env.RATE_LIMIT_MS || (10 * 60 * 1000) ,
			maxReq: process.env.RATE_MAX_REQS || 100,
			timeoutMs: process.env.POST_WINDOW_TIMEOUT || (15 * 60 * 1000),
			delayAfter: process.env.POST_DELAY_AFTER || 5,
			delayMs: process.env.POST_DELAY_MS || 250,
		},
	}
	return config;
}

module.exports = getConfig;