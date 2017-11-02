import winston from 'winston';
import path from 'path';
import mkdirp from 'mkdirp';
import config from '../config/environment';
import {checkNestedPropery} from './functions';

const globalErrorPath = (checkNestedPropery(config, 'errors', 'globalPath')) ? config.errors.globalPath : path.normalize(__dirname + '/../logs');

const debug = new winston.Logger({
  levels: {
    debug: 0
  },
  transports: [
    new (winston.transports.File)({
      dirname: (checkNestedPropery(config, 'errors', 'debug', 'directory')) ? config.errors.debug.directory : globalErrorPath,
      filename: (checkNestedPropery(config, 'errors', 'debug', 'filename')) ? config.errors.debug.filename : 'debug.log',
      level: 'debug',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: true
    }),
    new (winston.transports.Console)({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

const info = new winston.Logger({
  levels: {
    info: 1
  },
  transports: [
    new (winston.transports.File)({
      dirname: (checkNestedPropery(config, 'errors', 'info', 'directory')) ? config.errors.info.directory : globalErrorPath,
      filename: (checkNestedPropery(config, 'errors', 'info', 'filename')) ? config.errors.info.filename : 'info.log',
      level: 'info',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: true
    }),
    new (winston.transports.Console)({
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

var warn = new winston.Logger({
  levels: {
    warn: 2
  },
  transports: [
    new (winston.transports.File)({
      dirname: (checkNestedPropery(config, 'errors', 'warning', 'directory')) ? config.errors.warning.directory : globalErrorPath,
      filename: (checkNestedPropery(config, 'errors', 'warning', 'filename')) ? config.errors.warning.filename : 'warnings.log',
      level: 'warn',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: true
    }),
    new (winston.transports.Console)({
      level: 'warn',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

var error = new winston.Logger({
  levels: {
    error: 3
  },
  transports: [
    new (winston.transports.File)({
      dirname: (checkNestedPropery(config, 'errors', 'error', 'directory')) ? config.errors.error.directory : globalErrorPath,
      filename: (checkNestedPropery(config, 'errors', 'error', 'filename')) ? config.errors.error.filename : 'errors.log',
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: true
    }),
    new (winston.transports.Console)({
      level: 'error',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

var exports = {
  debug: function(msg)
  {
    if(
      (checkNestedPropery(config, 'errors', 'enable') && config.errors.enable === true)
      &&
      (!checkNestedPropery(config, 'errors', 'debug', 'enable')
        || (checkNestedPropery(config, 'errors', 'debug', 'enable')
        && config.errors.debug.enable !== false)
      ))
    {
      debug.debug(msg);
    }
  },
  info: function(msg)
  {
    if(
      (checkNestedPropery(config, 'errors', 'enable') && config.errors.enable === true)
      &&
      (!checkNestedPropery(config, 'errors', 'info', 'enable')
        || (checkNestedPropery(config, 'errors', 'info', 'enable')
        && config.errors.info.enable !== false)
      ))
    {
      info.info(msg);
    }
  },
  warn: function(msg)
  {
    if(
      (checkNestedPropery(config, 'errors', 'enable') && config.errors.enable === true)
      &&
      (!checkNestedPropery(config, 'errors', 'warn', 'enable')
        || (checkNestedPropery(config, 'errors', 'warn', 'enable')
        && config.errors.warn.enable !== false)
      ))
    {
      warn.warn(msg);
    }
  },
  error: function(msg)
  {
    if(
      (checkNestedPropery(config, 'errors', 'enable') && config.errors.enable === true)
      &&
      (!checkNestedPropery(config, 'errors', 'error', 'enable')
        || (checkNestedPropery(config, 'errors', 'error', 'enable')
        && config.errors.error.enable !== false)
      ))
    {
      error.error(msg);
    }
  },
  log: function(level,msg)
  {
    var lvl = exports[level];
    lvl(msg);
  },
  expressWinston: {
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ],
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorStatus: true,
    ignoreRoute: function (req, res) { return false; }
  }
};

mkdirp(globalErrorPath, function(err)
{
    if(err)
    {
      exports.error(err);
    }
    else
    {
      exports.info('Global log directory created!');
    }
});

if(checkNestedPropery(config, 'errors'))
{
  let logDirPaths = [];

  if(checkNestedPropery(config, 'errors', 'debug', 'directory'))
  {
    logDirPaths.push({logType: 'Debug', path: config.errors.debug.directory});
  }

  if(checkNestedPropery(config, 'errors', 'info', 'directory'))
  {
    logDirPaths.push({logType: 'Info', path: config.errors.info.directory});
  }

  if(checkNestedPropery(config, 'errors', 'warning', 'directory'))
  {
    logDirPaths.push({logType: 'Warning', path: config.errors.warning.directory});
  }

  if(checkNestedPropery(config, 'errors', 'error', 'directory'))
  {
    logDirPaths.push({logType: 'Error', path: config.errors.error.directory});
  }

  if(logDirPaths.length > 0)
  {
    logDirPaths.forEach(function(pathInfo)
    {
      mkdirp(pathInfo.path, function (err)
      {
          if(err)
          {
            exports.error(err);
          }
          else
          {
            exports.info(pathInfo.logType+' log directory created!');
          }
      });
    });
  }
}

module.exports = exports;
