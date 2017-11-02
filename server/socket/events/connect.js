'use strict';

import { 
	EVT_ON_CLIENT_DISCONNECT, 
	EVT_EMIT_NO_JACKPOT_TO_PLAY 
} from '../constants';
import onDisconnect from './disconnect';

/**
 * Emit No Jackpots To Play
 *
 * @param  {Socket} socket
 * @return {*}
 */
function emitNoJackpotsToPlay(socket)
{
	socket.emit(EVT_EMIT_NO_JACKPOT_TO_PLAY, {
 		error: "No Jackpot Found To Play. Please try again after some time"
 	});
}

/**
 * Emit No Jackpots To Play
 *
 * @param  {Integer} userId
 * @return {Promise}
 */
function getCurrentJackpotByUserId(userId)
{
	var jackpots = global.ticktockGameState.jackpots,
		returnjp = false,
		jackpotUser;

	for(var k in jackpots)
   	{
     	jackpotUser = jackpots[k].getUserById(userId);

     	if(jackpotUser !== false && !jackpotUser.isQuitted() && jackpots[k].gameStatus == 'STARTED')
     	{
     		returnjp = jackpots[k];
     	}
   	}

   	return new Promise(function(resolve, reject)
   	{
   		resolve(returnjp);
   	});
}

/**
 * Pick a new jackpot for the user
 *
 * @param  {Jackpot} currentJackpot
 * @param  {Integer} userId
 * @return {Promise}
 */
function getNewJackpotByUserId(currentJackpot, userId)
{
	var finalJackpot 	= currentJackpot,
		jackpots 		= global.ticktockGameState.jackpots;

	// First try to get any already started and having doomsday seconds > 0
	if(finalJackpot == false)
	{
		for(var k in jackpots)
	   	{
	     	if(jackpots[k].gameStatus == 'STARTED' && jackpots[k].doomsdayClockRemaining > 0)
	     	{
	     		finalJackpot = jackpots[k];
	     		break;
	     	}
	   	}
	}
	
	// Then try to get the first not started jackpot
	if(finalJackpot == false)
	{
		for(var j in jackpots)
	   	{
	   		if(jackpots[k].gameStatus == 'NOT_STARTED')
	     	{
	     		finalJackpot = jackpots[k];
	     		break;
	     	}
	   	}
	}
   	
   	// Return the promise
	return new Promise(function(resolve, reject)
	{
		resolve(finalJackpot);
	});
}

/**
 * Get appropriate jackpot for a user by ID
 *
 * @param  {Socket} socket
 * @return {*}
 */
function getUserJackpot(socket)
{
	var jackpots   		= global.ticktockGameState.jackpots,
        handshake   	= socket.handshake,
        userId      	= handshake.query.userId;

    if(jackpots.length == 0)
    {
     	emitNoJackpotsToPlay(socket);
     	return;
    }

    // First get existing jackpot the user is playing in
    getCurrentJackpotByUserId(userId).then(function(currentJackpot)
 	{
 		return getNewJackpotByUserId(currentJackpot, userId);

 	}).then(function(jackpot)
 	{
 		if(jackpot !== false)
 		{
 			var user = jackpot.getUserById(userId) || jackpot.addUserById(userId),
 				room = jackpot.getRoomName();

 			user.isActive 		= true;
 			user.currentSocket 	= socket;
 			socket.currentRoom  = room;
            socket.jackpot      = jackpot;
            socket.jackpotUser  = user;

            // Join the room now
            socket.join(room);

            // Emit socket events
            jackpot.emitSomeoneJoined();
            user.emitMeJoined();
            user.emitCanIBid();
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
}

/**
 * Handle On Socket Connection
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
	// Get appropriate user jackpot
	getUserJackpot(socket);

	// Handle post connect events
    handlePostConnectEvents(socket);
}