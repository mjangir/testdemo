'use strict';

function getUserIdBySocket(socket)
{
	var handshake 	= socket.handshake,
    	userId 		= handshake.query.userId;

    return userId;
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

     	if(jackpotUser !== false && !jackpotUser.isQuitted() && jackpots[k].isStarted())
     	{
     		returnjp = jackpots[k];
     	}
   	}

   	return new Promise(function(resolve, reject)
   	{
   		resolve({jackpot: returnjp, userId: userId});
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
	     	if(jackpots[k].isStarted() && jackpots[k].getClockRemaining('doomsday') > 0)
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
	   		if(jackpots[j].isNotStarted())
	     	{
	     		finalJackpot = jackpots[j];
	     		break;
	     	}
	   	}
	}
   	
   	// Return the promise
	return new Promise(function(resolve, reject)
	{
		resolve({jackpot: finalJackpot, userId: userId});
	});
}

export default function(input, value)
{
	var userId 		= input == 'socket' ? getUserIdBySocket(value) : value,
		jackpots 	= global.ticktockGameState.jackpots;

	if(jackpots.length == 0)
    {
     	return false;
    }

    // First get existing jackpot the user is playing in
    return getCurrentJackpotByUserId(userId).then(function(data)
 	{
 		return getNewJackpotByUserId(data.jackpot, data.userId);
 	});
}