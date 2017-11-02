import * as constants from '../config/constants';
import logger from './logger';
import {
  ValidationError,
  TimeoutError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ExclusionConstraintError,
  ConnectionRefusedError,
  AccessDeniedError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
  ConnectionTimedOutError,
  InstanceError
} from 'sequelize';

export const sequelizeErrorHandler = function(response)
{
  let errorConst;
  let errors = [];

  return function(error)
  {
    if(error instanceof ValidationError)
    {
      errorConst = constants.SEQ_VALIDATION_ERROR;

      error.errors.forEach(function(err){
        errors.push({
          field: err.path,
          message: err.message
        })
      });
    }
    else if(error instanceof TimeoutError)
    {
      errorConst = constants.SEQ_DB_QUERY_TIMEOUT_ERROR;
    }
    else if(error instanceof UniqueConstraintError)
    {
      errorConst = constants.SEQ_DB_UNIQUE_CONSTRAINT_ERROR;
    }
    else if(error instanceof ForeignKeyConstraintError)
    {
      errorConst = constants.SEQ_DB_FOREIGN_KEY_CONSTRAINT_ERROR;
    }
    else if(error instanceof ExclusionConstraintError)
    {
      errorConst = constants.SEQ_DB_EXCLUSION_CONSTRAINT_ERROR;
    }
    else if(error instanceof ConnectionRefusedError)
    {
      errorConst = constants.SEQ_CONN_CONNECTION_REFUSED_ERROR;
    }
    else if(error instanceof AccessDeniedError)
    {
      errorConst = constants.SEQ_CONN_ACCESS_DENIED_ERROR;
    }
    else if(error instanceof HostNotFoundError)
    {
      errorConst = constants.SEQ_CONN_HOST_NOT_FOUND_ERROR;
    }
    else if(error instanceof HostNotReachableError)
    {
      errorConst = constants.SEQ_CONN_HOST_NOT_REACHABLE_ERROR;
    }
    else if(error instanceof InvalidConnectionError)
    {
      errorConst = constants.SEQ_CONN_INVALID_CONNECTION_ERROR;
    }
    else if(error instanceof ConnectionTimedOutError)
    {
      errorConst = constants.SEQ_CONN_CONNECTION_TIMEOUT_ERROR;
    }
    else if(error instanceof InstanceError)
    {
      errorConst = constants.SEQ_INSTANCE_ERROR;
    }
    else
    {
      errorConst = constants.INTERNAL_SERVER_ERROR;
    }

    logger.error(errorConst.internalMessage);
    logger.error(error);

    response.status(errorConst.code);
    response.json({
      status: 'error',
      code: errorConst.code,
      message: errorConst.message,
      errors
    }).end();
  }
}

export default function(error, request, response, next)
{
  if(error.name == 'SyntaxError')
  {
    response.status(400);
    response.json({
      status: 400,
      message: "Bad Request!"
    }).end();
  }
  next();
}
