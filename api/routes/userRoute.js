const appRoot = require('app-root-path');
const userHandler = require(`${appRoot}/api/controllers/userController`);
const commonHandler = require(`${appRoot}/api/controllers/commonController`);

module.exports = function userRoute (router) {
  router.route('/user')
    .post(userHandler.register)
    .get(commonHandler.protected, userHandler.getProfile);
};
