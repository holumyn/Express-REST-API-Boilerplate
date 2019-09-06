const passport = require('passport');

/*
 * Check token for user data and role
 */
exports.protected = passport.authenticate('jwt', { session: false, });
