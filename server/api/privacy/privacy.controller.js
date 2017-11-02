'use strict';

import _ from 'lodash';
import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';

var Settings = sqldb.Settings;

/**
 * Response With Result
 *
 * @param  {Object} res
 * @param  {Object} statusCode
 * @return {String}
 */
function responseWithResult(res, statusCode)
{
  statusCode = statusCode || 200;
  return function(entity)
  {
    if(entity)
    {
      res.status(statusCode).json({
        status: 'success',
        data: entity.value
      }).end();
    }
  };
}

/**
 * Handle Entity Not Found
 *
 * @param  {Object} res
 * @return {String}
 */
function handleEntityNotFound(res) {
  return function(entity)
  {
    if(!entity)
    {
      res.status(404).json({
        status: 'error',
        code: constants.NOT_FOUND.code,
        message: constants.NOT_FOUND.message
      });
      return null;
    }
    return entity;
  };
}

/**
 * Get Privacy Policy
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const index = function(req, res)
{
  logger.debug("Getting Privacy Policy...");
  Settings.find({
    where: {
      key: 'privacy_text'
    }
  })
  .then(handleEntityNotFound(res))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};


export default {
  index
}