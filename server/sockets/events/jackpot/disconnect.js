'use strict';

import jackpotUser from '../../state/jackpot/user';

/**
 * On Socket Disconnect
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    return function()
    {
        if(socket.jackpotUser instanceof jackpotUser)
        {
            socket.jackpotUser.isActive = false;
            global.jackpotSocketNamespace.in(socket.currentRoom).emit('updated_jackpot_data', socket.jackpot.getUpdatedJackpotData());
        }
    }
}