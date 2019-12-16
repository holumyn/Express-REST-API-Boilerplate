const appRoot = require('app-root-path');
const logger = require(`${appRoot}/config/winston`);
const moment = require('moment');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const util = require('util');
const constants = require(`${appRoot}/api/constants/constants`);
const User = require(`${appRoot}/api/models/userModel`);
const Profile = require(`${appRoot}/api/models/profileModel`);
const emailHelper = require(`${appRoot}/api/helpers/emailHelper`);

async function hashPassword (salt, password) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }
  
async function regValidator (data) {
    const username = data.username;
    const email = data.email;
    const password = data.password;
  
    if (!username || username === '') {
        return 'Username is either missing or empty';
    }

    if (!email || email === '') {
      return 'Email is either missing or empty';
    }
  
    if (!password || password === '') {
      return 'Password is either missing or empty';
    }
  
    if (password.length < 6) {
      return 'Password is less than 6 characters';
    }
  
    return true;
}
  
async function sanitizeUsername (username) {
    try {
      const usernameExist = await User.findOne({ username, });
  
      if (usernameExist) {
        // generate a new username
        const uniqueNumber = crypto.randomBytes(8).toString('hex');
        const newUsername = `${username}-${uniqueNumber}`;
        return await sanitizeUsername(newUsername);
      }
      return username;
    } catch (error) {
      return false;
    }
}
  
exports.register = async function register (req, res) {
    try {
      const validated = await regValidator(req.fields);
  
      if (validated !== true) {
        return res.status(constants.HTTP_STATUS.FORBIDDEN.CODE).json({
          message: validated,
        });
      }
  
      // Check if user exist
      const user = await User.findOne({ email: req.fields.email, });
  
      // If user already exists
      if (user) {
        logger.info(`Account already exist ${user}`);
        return res.status(constants.HTTP_STATUS.OK.CODE).json({
          message: 'Account already exist',
        });
      }
  
      // Check if username exist and get a new one
      const newUsername = await sanitizeUsername(req.fields.username);
  
      if (newUsername === false) {
        logger.info('System could not validate username for new user');
        return res.status(constants.HTTP_STATUS.FORBIDDEN.CODE).json({
          message: 'System could not validate username for new user',
        });
      }
  
    
      // Prepare user details for DB
      const userDetails = new User(req.fields);
      const salt = crypto.randomBytes(16).toString('hex');
      const emailToken = crypto.randomBytes(64).toString('hex');
      userDetails.emailVerificationToken = emailToken;
      userDetails.username = newUsername;
      userDetails.salt = salt;
      userDetails.emailVerified = false;
      userDetails.role = constants.ACCOUNT_TYPE.REGULAR;
      userDetails.hash = await hashPassword(salt, req.fields.password);
      // Save user details to DB
      const newUser = await userDetails.save(userDetails);
  
      if (!newUser) {
        return res.status(constants.HTTP_STATUS.FORBIDDEN.CODE).json({
          message: 'User data failed to save',
        });
      }

        // Prepare new user profile
      let profileDetails = new Profile({
        user: newUser._id,
      });
      // Save profile to DB
      let newProfile = await profileDetails.save(profileDetails);
  
      if (!newProfile) {
        return res.status(constants.HTTP_STATUS.FORBIDDEN.CODE).json({
          message: 'Profile data failed to save',
        });
      }
  
    //   // Format and add notification
    //   const payloadName = notificationConstants.NOTIFICATION.USER.welcome.data.name;
    //   const payloadTitle = notificationConstants.NOTIFICATION.USER.welcome.data.title;
    //   const payloadBody = util.format(notificationConstants.NOTIFICATION.USER.welcome.data.body, req.fields.firstName);
    //   const payload = {};
    //   payload.name = payloadName;
    //   payload.title = payloadTitle;
    //   payload.body = payloadBody;
    //   notificationController.addNotification(newUser._id, payload, notificationConstants.NOTIFICATION.USER.type);
  
      // Set the email template variables
      const link = `${process.env.BASE_URL}/user/verify/${emailToken}`;
      let template = constants.TEMPLATES.verify_email;
      // send email to user, pick template if this is a temp user or a regular user
      emailHelper.sendMail(newUser.email, 'iCopyBet :: Welcome to iCopyBet', template, {
        link,
        username: newUser.username,
      })
        .then((info) => {
          logger.info(`Message Sent: ${info.messageId}`);
          logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        })
        .catch((sendErr) => { logger.error(`Error sending email: ${sendErr}`); });
  
    //   // Add to Elasticsearch
    //   const searchPayload = {
    //     userId: newUser._id.toString(),
    //     username: newUser.username,
    //     firstName: newProfile.firstName,
    //     lastName: newProfile.lastName,
    //   };
    //   searchService.createProfile(searchPayload);
  
      logger.info('Account created successfully');
      return res.status(constants.HTTP_STATUS.OK.CODE).json({
        // create token
        token: jwt.sign({
          sub: newUser._id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXPIRES, 10),
        }, process.env.JWT_TOKEN),
        userId: newUser._id,
      });
    } catch (error) {
      logger.error(`An error occured - ${error.message}`);
      return res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR.CODE).json({
        message: 'An error occured',
        error: error.message,
      });
    }
};
  

exports.getProfile = async function getProfile(req, res) {
  return res.status(constants.HTTP_STATUS.OK.CODE).json({
    message: 'Profile returned successfully',
  });

};

