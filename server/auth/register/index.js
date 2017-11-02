'use strict';

import express from 'express';
import auth from '../auth.service';
import * as constants from '../../config/constants';
import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import _ from 'lodash';
import {signupUserPhotoUpload} from '../../utils/functions';

const User = sqldb.User;

const router = express.Router();

router.post('/', function(req, res, next)
{
  let errors = [];

  console.log(req.file);

  // Validate all body parameters
  req.checkBody({
   'name': {
      notEmpty: {
        args: true,
        errorMessage: 'Name cannot be empty',
      }
    },
    'email': {
      isEmail: {
        args: true,
        errorMessage: 'Email is not valid'
      },
    }
  });

  if(req.method === 'POST')
  {
    req.checkBody('password', 'Invalid Password').notEmpty().withMessage('Password can not be empty');
  }

  // Get all error messages
  errors = req.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    res.status(422);
    res.json({
      status  : 'error',
      code    : constants.VALIDATION_ERROR.code,
      message : constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  logger.debug("Create user initializated");

  req.body.userGroupId = 2;

  let newUser = User.build(req.body);

  newUser.save()
    .then((function(res, statusCode){
      return function(entity)
      {
        if(entity)
        {
          entity = entity.get({ plain: true});

          delete entity.password;
          delete entity.salt;

          const token = auth.signToken({
            user_id : entity.id,
            status  : entity.status
          });

          res.status(201).json({
            status: 'success',
            data: _.assign(entity, {token: token, user_id: entity.id})
          }).end();
        }
      };
    }(res, 201)))
    .catch(sequelizeErrorHandler(res));
});

export default router;
