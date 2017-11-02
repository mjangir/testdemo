'use strict';

import * as constants from '../../config/constants';

/**
 * Validations For Get All Settings
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
 * Validations For Show Single Setting
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const show = function(request, response, next)
{

  let errors = null;

  // Check if provided setting ID is an integer
  request.checkParams('id', 'Invalid Setting ID').isInt();

  // Get all validation errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status: 'error',
      code: constants.BAD_REQUEST.code,
      message: constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  next();
}

/**
 * Validations For Create Setting
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const create = function(request, response, next) {

  let errors = null;

  // Validate all body parameters
  request.checkBody({
   'key': {
      notEmpty: true,
      errorMessage: 'Setting Key cannot be empty'
    }
  });

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(422);
    response.json({
      status: 'error',
      code: constants.VALIDATION_ERROR.code,
      message: constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  next();
}

/**
 * Validations For Update Setting
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const update = function(request, response, next) {

  let errors = null;

  request.checkBody({
   'key': {
      notEmpty: true,
      errorMessage: 'Setting Key cannot be empty'
    }
  });

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(422);
    response.json({
      status: 'error',
      code: constants.VALIDATION_ERROR.code,
      message: constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  request.body.updatedBy = request.user.user_id;

  // Pass to the next middleware
  next();
}

/**
 * Delete Setting
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const destroy = function(request, response, next) {

  let errors = null;

  // Check if Setting ID is integer
  request.checkParams('id', 'Invalid Setting ID').isInt();

  // Get all errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status: 'error',
      code: constants.BAD_REQUEST.code,
      message: constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }
  next();
}
