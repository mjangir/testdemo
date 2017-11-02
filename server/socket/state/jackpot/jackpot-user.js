'use strict';

import { 
	EVT_EMIT_CAN_I_PLACE_BID,
	EVT_EMIT_ME_JOINED 
} from '../../constants';

import { 
	convertAmountToCommaString, 
	getUserObjectById 
} from '../../../utils/functions';

function JackpotUser(jackpot, userId)
{
	this.userId 				= userId;
	this.jackpot 				= jackpot;
	this.joinedOn 				= new Date();
	this.isActive 				= true;
	this.availableBids 			= 10;
	this.normalBattleWinsCount 	= 0;
	this.advanceBattleWinsCount = 0;
	this.userGameStatus 		= 'PLAYING';
	this.bids 					= [];
}

JackpotUser.prototype.isQuitted = function()
{
	return this.userGameStatus == 'QUITTED';
}

JackpotUser.prototype.markAsInactive = function()
{
	var context = this;

	this.isActive = false;

	return new Promise(function(resolve, reject)
	{
		resolve(context.jackpot);
	});
}

JackpotUser.prototype.emitMeJoined = function()
{
	var socket 		= this.currentSocket,
		jackpot 	= this.jackpot,
		userInfo 	= getUserObjectById(this.userId);

	socket.emit(EVT_EMIT_ME_JOINED, {
	    jackpotInfo:    {
	        uniqueId:    jackpot.uniqueId,
	        name:        jackpot.title,
	        amount:      convertAmountToCommaString(jackpot.amount)
	    },
	    userInfo: {
	        name:               userInfo.name,
	        availableBids:      this.availableBids,
	        totalPlacedBids:    this.bids.length,
	    }
	});
}

JackpotUser.prototype.emitCanIBid = function()
{
	var socket 			= this.currentSocket,
		users 			= this.jackpot.users,
		minPlayers 		= this.jackpot.minPlayersRequired,
		lastBidUserId 	= this.jackpot.lastBidUserId,
		room 			= this.jackpot.getRoomName(),
		canIBid 		= false,
		namespace 		= global.ticktockGameState.jackpotSocketNs;

	if(users.length < minPlayers)
	{
		namespace.in(room).emit(EVT_EMIT_CAN_I_PLACE_BID, {canIBid: false});
	}
	else
	{
		socket.emit(EVT_EMIT_CAN_I_PLACE_BID, {
			canIBid: (lastBidUserId != this.userId)
		});
	}
}

export default JackpotUser;