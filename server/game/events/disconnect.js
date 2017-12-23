'use strict';

import JackpotUser from '../state/jackpot/jackpot-user';

/**
 * Handle On Socket Disconnect
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function onDisconnect(socket) {
	return function() {
    if(socket && socket.user && socket.user instanceof JackpotUser) {
      socket.user.isActive = false;
    }
	}
}
