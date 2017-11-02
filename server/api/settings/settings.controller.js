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
        data: entity
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
 * Handle Save Updates
 *
 * @param  {Object} updates
 * @return {String}
 */
function saveUpdates(updates)
{
  return function(entity)
  {
    return entity.updateAttributes(updates)
      .then(function(updated) {
        return updated;
      });
  };
}

/**
 * Remove Entity
 *
 * @param  {Object} res
 * @return {*}
 */
function removeEntity(res)
{
  return function(entity)
  {
    if(entity)
    {
      return entity.destroy()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

/**
 * Get All Settings
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {String}
 */
exports.index = function(req, res)
{
  logger.debug("Trying to find list of all settings.");
  Settings.findAll()
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Get Single Setting
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.show = function(req, res)
{
  logger.debug("Trying to find a setting.");
  Setting.find({
    where: {
      id: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Create A Setting
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.create = function(req, res)
{
  logger.debug("Create Setting initializated");
  Settings.create(req.body)
    .then(responseWithResult(res, 201))
    .catch(sequelizeErrorHandler(res));
};

/**
 * Update A Setting
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.update = function(req, res)
{
  if(req.body.id)
  {
    logger.debug("If setting id is found in body, delete it");
    delete req.body.id;
  }
  logger.debug("Finding setting with given ID");
  Settings.find({
    where: {
      id: 1
    }
  })
  .then(handleEntityNotFound(res))
  .then(saveUpdates(req.body))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Delete A Setting
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.destroy = function(req, res)
{
  logger.debug("Finding setting with given ID");
  Settings.find({
    where: {
      id: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Update Global Settings
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.updateGlobalSettingsVar = function(req, res)
{
  Settings.findAllSettingsAsJson(function(error, settings)
  {
    if(error == null)
    {
      global.globalSettings = settings;
      return res.status(200).json({
        status: 'success'
      }).end();
    }
    else
    {
      return res.status(200).json({
        status: 'error'
      }).end();
    }
  });
};