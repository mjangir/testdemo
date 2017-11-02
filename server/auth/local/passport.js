import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import logger from '../../utils/logger';
import * as constants from '../../config/constants';

function localAuthenticate(User, email, password, done)
{
  logger.debug('LOGIN::Find user by email for authencation...');

  User.find({
    where: {
      email: email.toLowerCase()
    }
  })
  .then(function(user)
  {
    if(!user)
    {
      logger.debug('LOGIN::User could not be found...');

      return done(null, false, {
        status: 'error',
        code: constants.AUTHENTICATION_FAILED.code,
        message: constants.AUTHENTICATION_FAILED.message
      });
    }

    logger.debug('LOGIN::User found and now check the password...');

    user.authenticate(password, function(authError, authenticated)
    {
      if(authError)
      {
        logger.debug('LOGIN::Passport authentication error occured...');
        logger.error('Passport Authentication Error Occured');
        logger.error(authError);

        return done(null, false, {
          status: 'error',
          code: constants.INTERNAL_SERVER_ERROR.code,
          message: constants.INTERNAL_SERVER_ERROR.message
        });
      }

      if(!authenticated)
      {
        logger.debug('LOGIN::Invalid password provided...');

        return done(null, false, {
          status: 'error',
          code: constants.AUTHENTICATION_FAILED.code,
          message: constants.AUTHENTICATION_FAILED.message
        });
      }
      else
      {
        logger.debug('LOGIN::Successful authentication, return the user...');
        return done(null, user);
      }
    });
  })
  .catch(function(error)
  {
    logger.error('Passport Authentication Error Occured');
    logger.error(error);

    return done(null, false, {
      status: 'error',
      code: constants.INTERNAL_SERVER_ERROR.code,
      message: constants.INTERNAL_SERVER_ERROR.message
    });
  });
}

export const setup = function(User, config)
{
  passport.use(new LocalStrategy({
    usernameField   : 'email',
    passwordField   : 'password'
  },
  function(email, password, done)
  {
    return localAuthenticate(User, email, password, done);
  }));
};
