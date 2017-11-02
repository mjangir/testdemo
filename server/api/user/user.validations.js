'use strict';

import * as constants from '../../config/constants';

/**
 * Validate Get All Users
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const index = function(request, response, next)
{
  next();
}

/**
 * Validate Show User
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const show = function(request, response, next)
{
  let errors = null;

  // Check if provided user ID is an integer
  request.checkParams('id', 'Invalid User ID').isInt();

  // Get all validation errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status  : 'error',
      code    : constants.BAD_REQUEST.code,
      message : constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  next();
}

/**
 * Create A User
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const create = function(request, response, next)
{

  let errors      = [],
      validatios  = {};

  // Validate all body parameters
  validatios['name'] = {
    notEmpty: {
      args: true,
      errorMessage: 'Name cannot be empty',
    }
  };

  validatios['email'] = {
    isEmail: {
      args: true,
      errorMessage: 'Email is not valid'
    }
  };
  validatios['password'] = {
    notEmpty: {
      args: true,
      errorMessage: 'Password cannot be empty',
    }
  };

  request.checkBody(validatios);

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(422);
    response.json({
      status  : 'error',
      code    : constants.VALIDATION_ERROR.code,
      message : constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  request.body.created_by = request.user.user_id;
  request.body.updated_by = request.user.user_id;
  next();
}

/**
 * Update A User
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const update = function(request, response, next)
{
  let errors      = [],
      validatios  = {};

  // Validate all body parameters
  validatios['name'] = {
    notEmpty: {
      args: true,
      errorMessage: 'Name cannot be empty',
    }
  };

  request.checkBody(validatios);

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(422);
    response.json({
      status  : 'error',
      code    : constants.VALIDATION_ERROR.code,
      message : constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  request.body.updated_by = request.user.user_id;
  next();
}

/**
 * Delete User
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const destroy = function(request, response, next)
{
  let errors = [];

  // Check if user ID is integer
  request.checkParams('id', 'Invalid User ID').isInt();

  // Get all errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status  : 'error',
      code    : constants.BAD_REQUEST.code,
      message : constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }
  next();
}
