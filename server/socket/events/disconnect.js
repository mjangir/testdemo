'use strict';

import JackpotUser from '../state/jackpot/jackpot-user';
import { EVT_EMIT_ON_CLIENT_DISCONNECT } from '../constants';

/**
 * Handle On Socket Disconnect
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function onDisconnect(socket)
{
	return function()
	{
		var user 		= socket.jackpotUser,
			namespace 	= global.ticktockGameState.jackpotSocketNs;

		if(user && user instanceof JackpotUser)
		{
			user.markAsInactive().then(function(jackpot)
			{
				namespace.in(socket.currentRoom).emit(EVT_EMIT_ON_CLIENT_DISCONNECT, {});
			});
		}
	}
}