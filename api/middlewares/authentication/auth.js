const appRoot = require('app-root-path');
const User = require(`${appRoot}/api/models/userModel`);
const passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = process.env.JWT_TOKEN;

const strategy = new JWTStrategy(jwtOptions, (jwtPayload, next) => {
  User.findOne({
    _id: jwtPayload.sub,
  }).then((user) => {
    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  });
});

passport.use(strategy);
