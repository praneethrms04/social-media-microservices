const winston = require("winston");
const { NODE_ENV } = require("../config");

const logger = winston.createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.splat()
  ),
  defaultMeta: { service: "search-servic" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: "combined.log",
      format: winston.format.json(),
    }),
  ],
});

module.exports = logger;
