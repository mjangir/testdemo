'use strict';

import config from './environment';
import {register as registerUserSocket} from '../api/user/user.socket';

var time = 60;

// When the user disconnects.. perform this
function onDisconnect(socket)
{

}

// When the user connects.. perform this
function onConnect(socket)
{
  // When the client emits 'info', this listens and executes
  socket.on('info', function(data)
  {
    socket.log(JSON.stringify(data, null, 2));
  });



setInterval(function(){
socket.emit('message', 'Time is ' + --time);
}, 1000);


  // Importing all model sockets
  registerUserSocket(socket);
}

export default function(socketio)
{
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function(socket)
  {
    socket.address      = socket.request.connection.remoteAddress + ':' + socket.request.connection.remotePort;
    socket.connectedAt  = new Date();

    socket.log = function(...data)
    {
      console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    socket.on('disconnect', function()
    {
      onDisconnect(socket);
      socket.log('SOCKET DISCONNECTED');
    });

    onConnect(socket);
    socket.log('SOCKET CONNECTED');
  });
};
