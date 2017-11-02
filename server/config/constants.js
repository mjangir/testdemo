'use strict';

export const BAD_REQUEST                = {code: 400, message: 'Bad Request!'};
export const UNAUTHORIZED_ACCESS        = {code: 401, message: 'Un-Authorized Access!'};
export const INVALID_OR_NO_ACCESS_TOKEN = {code: 401, message: 'Invalid Or No Access Token Provided!'};
export const AUTHENTICATION_FAILED      = {code: 401, message: 'Authentication Failed!'};
export const ACCESS_FORBIDDEN           = {code: 403, message: 'Access Forbidden!'};
export const UNPROCESSABLE_ENTITY       = {code: 422, message: 'Un-Processable Entity'};
export const VALIDATION_ERROR           = {code: 422, message: 'Validation Failed!'};
export const NOT_FOUND                  = {code: 404, message: 'Entity Not Found!'};
export const INTERNAL_SERVER_ERROR      = {code: 500, message: 'Internal Server Error Occured!'};
export const CONFLICT_ISSUE             = {code: 409, message: 'Conflict Issue!'};

//Sequelize Error Constants
export const SEQ_VALIDATION_ERROR                 = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Validation Failed!'};
export const SEQ_DB_QUERY_TIMEOUT_ERROR           = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'SQL Query Time Out!'};
export const SEQ_DB_UNIQUE_CONSTRAINT_ERROR       = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Unique Constraint Error Occured!'};
export const SEQ_DB_FOREIGN_KEY_CONSTRAINT_ERROR  = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Foreign Key Constraint Error Occured!'};
export const SEQ_DB_EXCLUSION_CONSTRAINT_ERROR    = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Exclusion Constraint Error Occured!'};
export const SEQ_CONN_CONNECTION_REFUSED_ERROR    = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Database Connection Refused!'};
export const SEQ_CONN_ACCESS_DENIED_ERROR         = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Database Access Denied!'};
export const SEQ_CONN_HOST_NOT_FOUND_ERROR        = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Database Host Not Found!'};
export const SEQ_CONN_HOST_NOT_REACHABLE_ERROR    = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Database Host Is Not Reachable!'};
export const SEQ_CONN_INVALID_CONNECTION_ERROR    = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Invalid Database Connection!'};
export const SEQ_CONN_CONNECTION_TIMEOUT_ERROR    = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Database Connection Time Out!'};
export const SEQ_INSTANCE_ERROR                   = {code: 500, message: 'Internal Server Error Occured!', internalMessage: 'Instance Error!'};
