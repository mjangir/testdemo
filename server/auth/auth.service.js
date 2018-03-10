'use strict';

import passport from 'passport';
import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {User} from'../sqldb';
import logger from '../utils/logger';
import * as constants from '../config/constants';
import {sequelizeErrorHandler} from '../utils/LiveErrorHandler';

const validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {

  return compose()

    // Validate JWT Token
    .use(function(req, res, next)
    {
      logger.debug('API ACCESS :: Validate JWT Token Starts.....');

      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token'))
      {
        logger.debug('API ACCESS :: Access Token string found in query string ');
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }

      logger.debug('API ACCESS :: Call express jwt validator function....');

      return validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(err, req, res, next)
    {
      if(err)
      {
        logger.debug('API ACCESS :: Token could not be validated...');

        logger.error(err);

        return res.status(constants.INVALID_OR_NO_ACCESS_TOKEN.code).json({
          status: 'error',
          code: constants.INVALID_OR_NO_ACCESS_TOKEN.code,
          message: constants.INVALID_OR_NO_ACCESS_TOKEN.message
        }).end();
      }

      logger.debug('API ACCESS :: Try to find user with ID provided by Express JWT...');

      User.find({
        where: {
          id: req.user.id
        }
      })
      .then(function(user)
      {
        if(!user)
        {
          logger.debug('API ACCESS :: User not found for this jwt token...');

          return res.status(constants.UNAUTHORIZED_ACCESS.code).json({
            status: 'error',
            code: constants.UNAUTHORIZED_ACCESS.code,
            message: constants.UNAUTHORIZED_ACCESS.message
          }).end();
        }

        logger.debug('API ACCESS :: User found and API access authorized...');
        req.user = user;
        next();
      })
      .catch(function(error)
      {
        logger.debug('API ACCESS :: Catch errors for JWT validations...');
        logger.error(error);
        sequelizeErrorHandler(res);
      });
  });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(user)
{
  return jwt.sign(user, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res)
{
  if(!req.user)
  {
    return res.status(404).send('Something went wrong, please try again.');
  }

  const token = signToken({
    user_id: req.user.id,
    status: req.user.status
  });
  
  res.cookie('token', token);
  res.redirect('/');
}

export default {
  isAuthenticated,
  signToken,
  setTokenCookie
}