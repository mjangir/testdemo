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

	// Emit socket events
	jackpot.emitSomeoneJoined();
	user.emitMeJoined();
	user.emitCanIBid();

	return new Promise(function(resolve, reject)
	{
		resolve(true);
	});
}