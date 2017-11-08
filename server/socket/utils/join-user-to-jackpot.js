'use strict';

export default function(jackpot, socket, userId)
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

	// After Join Jackpot
	user.afterJoinJackpot();

	return new Promise(function(resolve, reject)
	{
		resolve(true);
	});
}