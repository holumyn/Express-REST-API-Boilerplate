const winston = require('winston');
const fs = require('fs');
const logDir = process.env.LOG_DIR;
if (!fs.existsSync(logDir)) {
  fs.mkdir(logDir);
}

const options = {
  file: {
    level: 'info',
    filename: `${logDir}/info.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
