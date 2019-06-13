const dotenv = require('dotenv-flow').config();

if (dotenv.error) {
  throw dotenv.error;
}
var express = require('express'),
  app = express(),
  
  port = process.env.PORT || 9002;

const router = express.Router();
const appRoot = require('app-root-path');
const path = require('path');
const cors = require('cors');
const logger = require(`${appRoot}/config/winston`);
// DB connection
let db;
async function asyncFunction () {
  logger.info('Getting DB details');
  db =  require(`${appRoot}/config/dbConnection`);
}
asyncFunction();
const formidableMiddleware = require('express-formidable');
const userRoute = require(`${appRoot}/api/routes/userRoute`);
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(`${appRoot}/docs/api.json`);

app.use(cors());

app.use(formidableMiddleware({
  encoding: 'utf-8',
  uploadDir: './public/images/topic/',
  keepExtensions: true,
}));

// views folder
app.set('views', './public/view');

// specify template engine
app.set('view engine', 'pug');

app.listen(port);

// Authentication middleware
require(`${appRoot}/api/middlewares/authentication/auth`);


userRoute(router);

// root
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use('/api/v1', router);

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

console.log('Express boilerplate RESTful API server started on: ' + port);

module.exports = app;
