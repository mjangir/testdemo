'use strict';

import express from 'express';
import sqldb from './sqldb';
import config from './config/environment';
import http from 'http';
import socketioConf from './game';
import expressConf from './config/express';
import routesConf from './routes';

// Setup express web server and socket.io
const app 		= express();
const server 	= http.createServer(app);
const socketio 	= require('socket.io')(server, {
  serveClient : config.env !== 'production',
  path        : '/ticktock/socket.io'
});
socketioConf(socketio);
expressConf(app);
routesConf(app);

// Start server
function startServer()
{
  server.listen(config.port, config.ip, function()
  {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

// Sync Sequelize Database
sqldb.sequelize.sync()
  .then(startServer)
  .catch(function(err)
  {
    console.log('Server failed to start due to error: %s', err);
  });

// Expose app
exports = module.exports = app;
