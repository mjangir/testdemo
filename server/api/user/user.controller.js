'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';

let User = sqldb.User;

/**
 * Response With Result
 *
 * @param  {Object} res
 * @param  {Object} statusCode
 * @return {*}
 */
function responseWithResult(res, statusCode)
{
  statusCode = statusCode || 200;

  return function(entity)
  {
    if(entity)
    {
      if(typeof entity.get === 'function')
      {
        entity = entity.get({ plain: true});
        delete entity.password;
        delete entity.salt;
      }

      res.status(statusCode).json({
        code: 200,
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
 * @return {*}
 */
function handleEntityNotFound(res)
{
  return function(entity)
  {
    if (!entity)
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
 * Save Updates
 *
 * @param  {Object} updates
 * @return {*}
 */
function saveUpdates(updates)
{
  return function(entity)
  {
    return entity.updateAttributes(updates)
      .then(function(updated)
      {
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
        .then(function()
        {
          res.status(204).end();
        });
    }
  };
}

/**
 * Get All Users
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {String}
 */
const index = function(req, res)
{
  logger.debug("Trying to find list of all users");

  let queryWhere  = {};
  let where       = {};
  let findCond    = {};

  if(req.query && req.query.hasOwnProperty('where'))
  {
    queryWhere = JSON.parse(req.query.where);

    if(queryWhere.email)
    {
      where['email'] = {$like: '%' + queryWhere.email + '%'};
    }

    if(queryWhere.name)
    {
      where['name'] = {$like: '%' + queryWhere.name + '%'};
    }
  }

  if(req.query && req.query.hasOwnProperty('offset'))
  {
    findCond['offset'] = parseInt(req.query.offset, 10);
  }

  if(req.query && req.query.hasOwnProperty('limit'))
  {
    findCond['limit'] = parseInt(req.query.limit, 10);
  }

  findCond['where']       = where;
  findCond['attributes']  = ['id', 'name', 'email', 'created_at', 'updated_at', 'status'];
  findCond['include']     = [
    { model: sqldb.User, as: 'CreatedByUser', attributes: ['id', 'name', 'email'],required: false },
    { model: sqldb.User, as: 'UpdatedByUser', attributes: ['id', 'name', 'email'],required: false}
  ];

  User.findAndCountAll(findCond)
      .then(responseWithResult(res, 200))
      .catch(sequelizeErrorHandler(res));
};

/**
 * Get Single User
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {String}
 */
const show = function(req, res)
{
  logger.debug("Trying to find a user");

  User.find({
    where: {
      id: req.params.id
    },
    exclude: ['password', 'salt'],
    include: [
      { model: sqldb.User, as: 'CreatedByUser', attributes: ['id', 'name', 'email'], required: false },
      { model: sqldb.User, as: 'UpdatedByUser', attributes: ['id', 'name', 'email'], required: false }
    ]
  })
  .then(handleEntityNotFound(res))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};


/**
 * Create A User
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {String}
 */
const create = function(req, res)
{
  logger.debug("Create user initializated");

  req.body.username = req.body.email.match(/^([^@]*)@/) ? req.body.email.match(/^([^@]*)@/)[1] : "";

  let newUser = User.build(req.body);

  newUser.save()
        .then(responseWithResult(res, 201))
        .catch(sequelizeErrorHandler(res));
};

/**
 * Update A Jackpot
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const update = function(req, res)
{
  if(req.body.id)
  {
    logger.debug("If user id is found in body, delete it");
    delete req.body.id;
  }

  if(req.body.email)
  {
    delete req.body.email;
  }
  

  logger.debug("Finding user with given ID");
  User.find({
    where: {
      id: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(saveUpdates(req.body))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Delete A User
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const destroy = function(req, res)
{
  logger.debug("Finding user with given ID");

  User.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(sequelizeErrorHandler(res));
};

// Change User password
const changePassword = function(req, res, next)
{
  const userId  = req.user.user_id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  User.find({
    where: {
      id: userId
    }
  })
  .then(function(user)
  {
    if(user.authenticate(oldPass))
    {
      user.password = newPass;

      return user.save()
        .then(function()
        {
          res.status(204).end();
        })
        .catch(sequelizeErrorHandler(res));
    }
    else
    {
      return res.status(403).json({
        'status': 'error',
        'code': 403,
        'message': 'User could to be authenticated to change the password'
      });
    }
  });
};

// Authentication callback
const authCallback = function(req, res, next)
{
  res.redirect('/');
};

export default {
  index,
  show,
  create,
  update,
  destroy,
  changePassword,
  authCallback
}