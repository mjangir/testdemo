'use strict';

import {
	EVT_ON_APP_DISCONNECT
} from '../constants';

import getUserJackpotGame from '../utils/get-user-jackpot-game';
import joinUserToJackpotGame from '../utils/join-user-to-jackpot-game';
import onDisconnect from './disconnect';
import handlePostConnectJackpotEvents from './jackpot';
import handlePostConnectBattleEvents from './battle';

/**
 * Handle post connection events
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handlePostConnectEvents(socket)
{
	// On socket disconnect
    socket.on(EVT_ON_APP_DISCONNECT, onDisconnect(socket));

    // Handle Post Connect Jackpot Events
    handlePostConnectJackpotEvents(socket);

    // Handle Post Connect Battle Events
    handlePostConnectBattleEvents(socket);
}

/**
 * Handle On Socket Connection
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
	// Find appropriate user jackpot game
	var handshake 	= socket.handshake,
      userId 		  = handshake.query.userId;

  getUserJackpotGame(userId).then(function(data) {
    return joinUserToJackpotGame(data.game, socket, data.userId);
  }).then(function() {
    
  }).catch(function(status) {
    // Emit no jackpot found
  });

	// Handle post connect events
  handlePostConnectEvents(socket);
}
