'use strict';

import {
	EVT_EMIT_JACKPOT_GAME_QUITTED,
	EVT_EMIT_JACKPOT_NO_JACKPOT_TO_PLAY
} from '../../constants';

import getUserJackpot from '../../utils/get-user-jackpot';
import joinUserToJackpot from '../../utils/join-user-to-jackpot';

function emitNoJackpotToPlay(socket)
{
	socket.emit(EVT_EMIT_JACKPOT_NO_JACKPOT_TO_PLAY, {
 		error: "No Jackpot Found To Play. Please try again after some time"
 	});
}

function leaveCurrentAndGetNewJackpot(jackpot, userId, socket)
{
	var user = jackpot.getUserById(userId),
		room = jackpot.getRoomName(),
		newJackpot;

	// Leave the room for this jackpot now
    socket.leave(room, function()
    {
    	if(!user)
    	{
    		return;
    	}
    	
    	// Make this user's online staus inactive for this jackpot and game status too
	    user.isActive    	= false;
	    user.userGameStatus = 'QUITTED';

	    // Emit event to this user that he has been quitted from this game
	    socket.emit(EVT_EMIT_JACKPOT_GAME_QUITTED, {status: true});

	    // Notify to old jackpot users that somebody quitted
	    jackpot.emitSomeoneQutted();

	    // Get a new jackpot for this user to join a new game
	    newJackpot = getUserJackpot('userId', userId);

	    if(newJackpot === false)
 		{
 			emitNoJackpotToPlay(socket);
		 	return;
 		}

 		newJackpot.then(function(data)
 		{
 			if(data.jackpot == false)
 			{
 				emitNoJackpotToPlay(socket);
		 		return;
 			}

 			joinUserToJackpot(data.jackpot, socket, data.userId);
 		});
    });
}

function handleQuitGame(data, socket)
{
	var gotJackpot;

	if(!data.userId)
	{
		return;
	}

	gotJackpot = getUserJackpot('userId', data.userId);

    if(gotJackpot === false)
    {
     	return;
    }

    gotJackpot.then(function(data)
 	{
 		var currentJackpot 	= data.jackpot,
 			userId 			= data.userId;

 		if(currentJackpot !== false)
 		{
 			leaveCurrentAndGetNewJackpot(currentJackpot, userId, socket);
 		}
 	});
}

export default function(socket)
{
	return function(data)
	{
		handleQuitGame(data, socket);
	}
}