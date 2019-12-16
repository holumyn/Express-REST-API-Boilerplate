const appRoot = require('app-root-path');
const userHandler = require(`${appRoot}/api/controllers/userController`);
const commonHandler = require(`${appRoot}/api/controllers/commonController`);
const { ACCOUNT_TYPE } = require(`${appRoot}/api/constants/constants`);

module.exports = function userRoute (router) {
  router.route('/user')
    .post(userHandler.register)
    .get(commonHandler.authorize(ACCOUNT_TYPE.REGULAR), userHandler.getProfile);
};
