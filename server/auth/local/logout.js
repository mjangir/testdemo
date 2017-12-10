'use strict';

import express from 'express';
import passport from 'passport';
import auth from '../auth.service';
import logger from '../../utils/logger';
import * as constants from '../../config/constants';
import sqldb from '../../sqldb';

const User = sqldb.User;

const router = express.Router();

router.get('/', function(req, res, next)
{
  req.session.destroy(function (err) {

    if(req.user && req.user.user_id)
    {
      User.find({
        where: {
          id: req.user.user_id
        }
      })
      .then(function(user)
      {
        user.updateAttributes({
          deviceToken: null
        });
      });
    }

    res.status(200).json({
      status  : 'success',
      code    : 200,
      message : 'Logout Successful!'
    });
  });
});

export default router;
