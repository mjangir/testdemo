'use strict';

import path from 'path';
import _ from 'lodash';

const sharedConfig  = require('./shared');
const envConfig     = require('./' + process.env.NODE_ENV);
const globalConfig  = {
  protocol: 'http',
  env     : process.env.NODE_ENV,
  root    : path.normalize(__dirname + '/../../..'),
  port    : process.env.PORT || 9000,
  ip      : process.env.IP || '0.0.0.0',
  seedDB  : false,
  secrets : {
    session: 'ticktock-secret'
  },
  errors  : {
    enable      : true,
    globalPath  : path.normalize(__dirname + '/../../logs'),
    debug       : {
      filename: 'debug.log'
    },
    info        : {
      filename: 'info.log'
    },
    error       : {
      filename  : 'errors.log',
    },
    warning     : {
      filename  : 'warnings.log'
    }
  },
  facebook : {
    clientID      : process.env.FACEBOOK_ID || 'id',
    clientSecret  : process.env.FACEBOOK_SECRET || 'secret',
    callbackURL   : (process.env.DOMAIN || '') + '/auth/facebook/callback'
  }
};

export default _.merge(
  globalConfig,
  sharedConfig,
  envConfig || {}
);
