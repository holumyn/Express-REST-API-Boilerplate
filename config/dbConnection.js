const mongoose = require('mongoose');
const appRoot = require('app-root-path');
const logger = require(`${appRoot}/config/winston`);

async function dbConnectionInitialize() {
  let dbUser = null;
  let dbPass = null;
  let dbHost = null;
  let dbName = null;
  let dbPort = null;

  if (process.env.IS_PROD_ENV === 'true') {
    logger.info('Prod environment');
    /**
     * Consider loading credentials from a key management system i.e Azure Key Vault, AWS KMS etc
     */
  } else {
    logger.info('Non Prod Environment');
    dbUser = process.env.DB_USER;
    dbPass = process.env.DB_PASS;
    dbHost = process.env.DB_HOST;
    dbPort = process.env.DB_PORT || 19078;
    dbName = process.env.DB_NAME;
  }

  logger.info(`dbUser: ${dbUser}`);
  logger.info(`dbPass: ${dbPass}`);
  logger.info(`dbHost: ${dbHost}`);
  logger.info(`dbPort: ${dbPort}`);
  logger.info(`dbName: ${dbName}`);

  const dbHostPortName = `${dbHost}:${dbPort}/${dbName}`;

  // Use this for SSL connection - Like UAT/PROD
  //const dbConnection = `mongodb://${dbUser}:${dbPass}@${dbHostPortName}?ssl=true`;

  // Use this for non SSL connection - Like test/dev
  const dbConnection = `mongodb://${dbUser}:${dbPass}@${dbHostPortName}`;

  logger.debug(`dbConnection: ${dbConnection}`);


  mongoose.Promise = global.Promise;

  const options = {
    useNewUrlParser: true,
    autoIndex: process.env.DB_AUTO_INDEX || false,
    reconnectTries: process.env.DB_RECONNECT_MAX_RETRIES || Number.MAX_VALUE,
    reconnectInterval: process.env.DB_RECONNECT_INTERVAL || 500,
    poolSize: process.env.DB_POOL_SIZE || 10,
    bufferMaxEntries: process.env.DB_BUFFER_MAX_ENTRIES || 0,
  };

  mongoose.connection.on('connected', () => {
    logger.info(`DB connected to ${dbHostPortName}`);
  });
  mongoose.connection.on('error', (err) => {
    logger.error(`DB connection error ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    logger.info('DB disconnected');
  });


  /**
       * Taking care of DB connections.
       */
  process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
      process.kill(process.pid, 'SIGUSR2');
    });
  });

  process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('app shutdown', () => {
      process.exit(0);
    });
  });

  const gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(() => {
      logger.info(`Mongoose disconnected through ${msg}`);
      callback();
    });
  };

  // Use connect method to connect to the Server
  mongoose.connect(dbConnection, options, (err, db) => {
    if (err) {
      logger.error(`Unable to connect to the mongoDB server. Error: ${err.message}`);
    } else {
      logger.debug(`Connection established to ${dbHostPortName}`);
      /*
          mongoose.connection.close(function() {
            console.log('DB disconnected');
          })
          */
    }
  });
  module.exports = mongoose;
}


dbConnectionInitialize();

