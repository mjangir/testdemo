'use strict';

export default function(socketio)
{
    // Create Namespace
    var namespace = socketio.of('battle');

    // On connection
    namespace.on('connection', function(socket)
    {

    });
}