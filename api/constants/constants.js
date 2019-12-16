const httpStatus = {
    OK: {
      CODE: 200,
      MESSAGE: 'The request has succeeded.',
    },
    CREATED: {
      CODE: 201,
      MESSAGE: 'Created successfully',
    },
    NO_CONTENT: {
      CODE: 204,
      MESSAGE: 'No content',
    },
    BAD_REQUEST: {
      CODE: 400,
      MESSAGE: 'The server could not understand the request.',
    },
    UNAUTHORIZED: {
      CODE: 401,
      MESSAGE: 'The requested resource requires an authentication.',
    },
    FORBIDDEN: {
      CODE: 403,
      MESSAGE: 'The authentication failed.',
    },
    NOTFOUND: {
      CODE: 404,
      MESSAGE: 'The requested resource not found.',
    },
    METHOD_NOT_ALLOWED: {
      CODE: 405,
      MESSAGE: 'The requested method is not allowed for the specified resoure',
    },
    INTERNAL_SERVER_ERROR: {
      CODE: 500,
      MESSAGE: 'There was an internal server error while processing the request.',
    },
  };

exports.ROLES = {
    regular: 'REGULAR',
    contributor: 'CONTRIBUTOR',
  };

exports.TEMPLATES = {
    verify_email: 'emailVerificationTemplate',
    email_verified: 'emailVerificationSuccessful',
    reset_password: 'passwordReset',
  };
  
exports.USER_AGENT = {
    web: 'web',
    mobile: 'mobile',
  };

exports.ACCOUNT_TYPE = {
    ANONYMOUS: 'ANONYMOUS',
    REGULAR: 'REGULAR',
    SYSTEM_ADMIN: 'SYSTEM_ADMINISTRATOR',
    TEMP: 'TEMP',
};

exports.PROFILE_AVATAR = `${process.env.IMG_BASE_URL}/public/images/avatar.png`;

module.exports.HTTP_STATUS = httpStatus;
  
  