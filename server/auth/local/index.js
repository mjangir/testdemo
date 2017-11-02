'use strict';

import express from 'express';
import passport from 'passport';
import auth from '../auth.service';
import logger from '../../utils/logger';
import * as constants from '../../config/constants';

const router = express.Router();

router.post('/', function(req, res, next)
{
  passport.authenticate('local', function(err, user, info)
  {
    const error = err || info;

    if(error)
    {
      logger.debug(error);

      return res.status(error.code).json(error);
    }

    if(!user)
    {
      logger.debug('LOGIN::Authentication succeed but still error in user...');

      return res.status(constants.NOT_FOUND.code).json({
        status: 'error',
        code: constants.NOT_FOUND.code,
        message: 'Something went wrong, please try again.'
      });
    }

    logger.debug('LOGIN::All things went well. Send JWT token in resposne...');

    const token = auth.signToken({
      user_id : user.id,
      status  : user.status
    });

    res.status(200).json({
      status  : 'success',
      code    : 200,
      message : 'Authentication Successful!',
      data    : {
        token,
        user_id: user.id
      }
    });
  })(req, res, next)
});

export default router;
