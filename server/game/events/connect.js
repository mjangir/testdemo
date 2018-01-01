'use strict';

import {
  EVT_ON_APP_DISCONNECT,
  
  HOME_SCREEN_SCENE_GAME,
  HOME_SCREEN_SCENE_NO_JACKPOT
} from '../constants';

import getUserJackpotGame from '../utils/get-user-jackpot-game';
import joinUserToJackpotGame from '../utils/join-user-to-jackpot-game';
import onDisconnect from './disconnect';
import handlePostConnectJackpotEvents from './jackpot';
import handlePostConnectBattleEvents from './battle';
import updateHomeScreen from '../utils/emitter/update-home-screen';

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
  }).then(function(data) {
    var game = data.game;
    updateHomeScreen(game, HOME_SCREEN_SCENE_GAME);
  }).catch(function(status) {
    updateHomeScreen(false, HOME_SCREEN_SCENE_NO_JACKPOT, false, socket);
  });

	// Handle post connect events
  handlePostConnectEvents(socket);
}
