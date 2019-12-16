const appRoot = require('app-root-path');
const logger = require(`${appRoot}/config/winston`);
const constants = require(`${appRoot}/api/constants/constants`);
const User = require(`${appRoot}/api/models/userModel`);
const passport = require('passport');

/*
 * Check token for user data and role
 */
const protectedRoute = passport.authenticate('jwt', { session: false, });

exports.authorizeRolesMiddleware = function authorizeRolesMiddleware(roles = []) {
    if (typeof roles === 'string') roles = [roles]; // eslint-disable-line
    return async (req, res, next) => { // eslint-disable-line consistent-return
      try {
        if (!Array.isArray(roles)) {
          logger.error(`Invalid roles: type ${typeof roles} is not valid.`);
          return res
            .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR.CODE)
            .json({
              message: 'Internal server error.',
            });
        }
  
        if (!req.user) {
          if (roles.includes(constants.ACCOUNT_TYPE.TEMP)) {
            if (!req.body || !req.body.email) {
              req.user = {
                _id: 'ANONYMOUS_USER',
                role: [constants.ACCOUNT_TYPE.ANONYMOUS],
              };
            } else {
              const dbuser = await User.findOne({
                email: req.body.email,
              });
  
              if (!dbuser) {
                logger.error(`authorizeRolesMiddleware - User not found for email: ${req.body.email}`);
                return res.status(constants.HTTP_STATUS.NOTFOUND.CODE).json({
                  message: 'Permission denied',
                });
              }
  
              if (!dbuser.role.includes(constants.ACCOUNT_TYPE.TEMP)) {
                logger.error('authorizeRolesMiddleware User role does not include required role');
                return res.status(constants.HTTP_STATUS.UNAUTHORIZED.CODE).json({
                  message: 'Permission denied',
                });
              }
  
              req.user = dbuser;
            }
          } else {
            req.user = {
              _id: 'ANONYMOUS_USER',
              role: [constants.ACCOUNT_TYPE.ANONYMOUS],
            };
          }
        } else if (!req.user._id) {
          req.user = {
            ...req.user,
            _id: 'ANONYMOUS_USER',
            role: [constants.ACCOUNT_TYPE.ANONYMOUS],
          };
        }
  
        // note: I assume all reqs rejected if roles is empty.
        if (!roles.length) {
          logger.error(`User: ${req.user._id} failed role check. Route rejects all roles.`);
          return res
            .status(constants.HTTP_STATUS.UNAUTHORIZED.CODE)
            .json({
              message: 'Permission denied!',
            });
        }
  
        const userRoles = req.user.role;
        let userRoleExist;
        let authorized = false;
        for (let i = 0; i < userRoles.length; i++) { // eslint-disable-line
          const userRole = userRoles[i];
  
          userRoleExist = Object.values(constants.ACCOUNT_TYPE).includes(userRole);
          if (!userRoleExist) {
            logger.error(`User: ${req.user._id} failed role check. Invalid role ${userRole}.`);
            return res
              .status(constants.HTTP_STATUS.UNAUTHORIZED.CODE)
              .json({
                message: 'Permission denied!',
              });
          }
  
          if (!authorized && roles.includes(userRole)) authorized = true;
        }
  
        if (!authorized) {
          logger.error(`User: ${req.user._id} failed role check. Required roles are ${roles}`);
          return res
            .status(constants.HTTP_STATUS.UNAUTHORIZED.CODE)
            .json({
              message: 'Permission denied!',
            });
        }
  
        next();
      } catch (err) {
        logger.error(`authorizeRolesMiddleware Failed to authorize user ERROR: ${err.message}`);
        return res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR.CODE).json({
          message: constants.HTTP_STATUS.INTERNAL_SERVER_ERROR.MESSAGE,
        });
      }
    };
  };
  
exports.authorize = function authorize(roles) {
  return [
    protectedRoute,
    this.authorizeRolesMiddleware(roles),
  ];
};
  
