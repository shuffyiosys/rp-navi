/**
 * Creates a new logger instance using Winston.
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, colorize, splat, printf } = format;
const path = require("path");
require("winston-daily-rotate-file");

function getOutputType(logName) {
	let outputs = [];
	if (process.env.LOG_OUTPUT === "logfile") {
		outputs.push(
			new transports.DailyRotateFile({
				filename: path.join(process.env.LOG_PATH, `${logName}-info.log`),
				frequency: "24h",
				datePattern: "YYYY-MM-DD",
				level: "info",
				size: "10m",
				maxFiles: "30d",
				timestamp: true,
			})
		);
		outputs.push(
			new transports.DailyRotateFile({
				filename: path.join(process.env.LOG_PATH, `${logName}-errors.log`),
				frequency: "24h",
				datePattern: "YYYY-MM-DD",
				level: "error",
				size: "10m",
				maxFiles: "30d",
				timestamp: true,
			})
		);
	}
	outputs.push(
		new transports.Console({
			level: process.env.LOG_LEVEL,
		})
	);
	return outputs;
}

const logger = createLogger({
	format: combine(
		colorize(),
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		splat(),
		printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
	),
	transports: getOutputType("server"),
});

const httpLogger = createLogger({
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		splat(),
		printf((info) => `${info.timestamp}: ${info.message}`.split("\n")[0])
	),
	transports: getOutputType("http"),
});

httpLogger.stream = {
	write: (message) => httpLogger.info(message),
};

function formatJson(jsonObj, pretty = true) {
	if (pretty) {
		return JSON.stringify(jsonObj, null, 4);
	} else {
		return JSON.stringify(jsonObj);
	}
}

module.exports = {
	logger,
	httpLogger,
	formatJson,
};
