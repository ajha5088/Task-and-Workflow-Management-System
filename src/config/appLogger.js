const { createLogger, format, transports } = require('winston');

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple()
  )
});

const fileTransports = [
  new transports.File({ filename: 'error.log', level: 'error' }),
  new transports.File({ filename: 'combined.log' })
];

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: fileTransports
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

module.exports = logger;
