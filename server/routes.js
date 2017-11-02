'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app)
{
  app.use('/api/users', require('./api/user'));
  app.use('/api/jackpots', require('./api/jackpot'));
  app.use('/api/settings', require('./api/settings'));
  app.use('/api/me', require('./api/me'));
  app.use('/api/privacy-policy', require('./api/privacy'));
  app.use('/auth', require('./auth'));

  // Static contents route
  app.use('/api/static', require('./api/static'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth)/*')
   .get(errors[404]);
};
