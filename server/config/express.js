'use strict';

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import path from 'path';
import lusca from 'lusca';
import config from './environment';
import passport from 'passport';
import session from 'express-session';
import expressMysqlSession from 'express-mysql-session';
import winston from 'winston';
import expressWinston from 'express-winston';
import logger from '../utils/logger';
import liveErrorHandler from '../utils/LiveErrorHandler';
import expressValidator from 'express-validator';
import ejs from 'ejs';
import connectLiveReload from 'connect-livereload';
import cors from 'cors';

export default function(app)
{
  var env = app.get('env');

  // Set express app middlewares
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(expressValidator({
    errorFormatter: function(field, message, value) {
      return { field, message };
    }
  }));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Setup express-mysql session
  const MySQLStore    = expressMysqlSession(session);
  const sessionStore  = new MySQLStore({
      host                    : config.sequelize.host,
      port                    : config.sequelize.options.port,
      user                    : config.sequelize.username,
      password                : config.sequelize.password,
      database                : config.sequelize.database,
      checkExpirationInterval : 900000,
      expiration              : 86400000,
      createDatabaseTable     : true,
      schema: {
        tableName     : 'sessions',
        columnNames   : {
          session_id  : 'session_id',
          expires     : 'expires',
          data        : 'data'
        }
      }
    });

  app.use(session({
    name              : 'ticktock_session',
    secret            : config.secrets.session,
    saveUninitialized : true,
    resave            : false,
    store             : sessionStore
  }));

  // Setup lusca configuration
  if(env !== 'test')
  {
    app.use(lusca({
      csrf    : false,
      xframe  : 'SAMEORIGIN',
      hsts    : {
        maxAge            : 31536000,
        includeSubDomains : true,
        preload           : true
      },
      xssProtection       : true
    }));
  }

  // Setup app client path
  app.set('appPath', path.join(config.root, 'client'));

  // Setup express winston middleware
  if(env === 'production' || env === 'development' || env === 'test')
  {
    app.use(expressWinston.logger(logger.expressWinston));
  }

  // Only production specific settings
  if(env === 'production')
  {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));
    app.use(liveErrorHandler);
  }

  // Only development specific settings
  if(env === 'development')
  {
    app.use(connectLiveReload());
  }

  // Both development and test specific settings
  if(env === 'development' || env === 'test')
  {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));
    app.use(liveErrorHandler);
  }
}