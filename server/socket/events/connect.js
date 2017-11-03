'use strict';

import { 
	EVT_ON_CLIENT_DISCONNECT, 
	EVT_EMIT_JACKPOT_NO_JACKPOT_TO_PLAY,
	EVT_ON_JACKPOT_GAME_QUITTED
} from '../constants';

import getUserJackpot from '../utils/get-user-jackpot';
import joinUserToJackpot from '../utils/join-user-to-jackpot';
import onDisconnect from './disconnect';
import handlePostConnectJackpotEvents from './jackpot';
import handlePostConnectNormalBattleEvents from './normal-battle';
import handlePostConnectAdvanceBattleEvents from './advance-battle';
import handlePostConnectMoneyBattleEvents from './money-battle';

/**
 * Emit No Jackpots To Play
 *
 * @param  {Socket} socket
 * @return {*}
 */
function emitNoJackpotsToPlay(socket)
{
	socket.emit(EVT_EMIT_JACKPOT_NO_JACKPOT_TO_PLAY, {
 		error: "No Jackpot Found To Play. Please try again after some time"
 	});
}

/**
 * Get appropriate jackpot for a user by ID
 *
 * @param  {Socket} socket
 * @return {*}
 */
function findUserJackpot(socket)
{
	var gotJackpot = getUserJackpot('socket', socket);

    if(gotJackpot === false)
    {
     	emitNoJackpotsToPlay(socket);
     	return;
    }

    gotJackpot.then(function(data)
 	{
 		var jackpot = data.jackpot,
 			userId 	= data.userId;

 		if(jackpot !== false)
 		{
 			joinUserToJackpot(jackpot, socket, userId);
 		}
 		else
 		{
 			emitNoJackpotsToPlay(socket);
     		return;
 		}
 	});
}

/**
 * Handle post connection events
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handlePostConnectEvents(socket)
{
	// On socket disconnect
    socket.on(EVT_ON_CLIENT_DISCONNECT, onDisconnect(socket));

    // Handle Post Connect Jackpot Events
    handlePostConnectJackpotEvents(socket);

    // Handle Post Connect Normal Battle Events
    handlePostConnectNormalBattleEvents(socket);

    // Handle Post Connect Advance Battle Events
    handlePostConnectAdvanceBattleEvents(socket);

    // Handle Post Connect Money Battle Events
    handlePostConnectMoneyBattleEvents(socket);
}

/**
 * Handle On Socket Connection
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
	// Find appropriate user jackpot
	findUserJackpot(socket);

	// Handle post connect events
    handlePostConnectEvents(socket);
}