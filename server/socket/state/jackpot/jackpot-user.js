'use strict';

import { 
	EVT_EMIT_JACKPOT_CAN_I_BID,
	EVT_EMIT_JACKPOT_ME_JOINED,
	EVT_EMIT_JACKPOT_MY_BID_PLACED
} from '../../constants';

import { 
	convertAmountToCommaString, 
	getUserObjectById 
} from '../../../utils/functions';

import Jackpot from './jackpot';
import NormalBattleLGame from '../normal-battle/game';
import AdvanceBattleLGame from '../advance-battle/game';

function JackpotUser(jackpot, userId)
{
	this.userId 				= userId;
	this.jackpot 				= jackpot;
	this.joinedOn 				= new Date();
	this.isActive 				= true;
	this.normalBattleWinsCount 	= 0;
	this.advanceBattleWinsCount = 0;
	this.userGameStatus 		= 'PLAYING';
	this.availableBids 			= {
		'jackpot' 		: 0,
		'normalBattle' 	: {},
		'advanceBattle' : {}
	};
	this.placedBids 			= {
		'jackpot' 		: [],
		'normalBattle' 	: [],
		'advanceBattle' : []
	};

	this.setDefaultAvailableBids();
}

JackpotUser.prototype.setDefaultAvailableBids = function()
{
	var key 		= 'jackpot_setting_default_bid_per_user_per_game',
		settings 	= global.ticktockGameState.settings,
		defaultBid 	= (settings.hasOwnProperty(key) && settings[key] != "") ? parseInt(settings[key], 10) : 10;

	this.availableBids['jackpot'] = defaultBid;
}

JackpotUser.prototype.isQuitted = function()
{
	return this.userGameStatus == 'QUITTED';
}

JackpotUser.prototype.quitGame = function()
{
	this.userGameStatus = 'QUITTED';
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
		userInfo 	= getUserObjectById(this.userId),
		bidContainer= this.jackpot.bidContainer,
		bidsByUser 	= bidContainer.getAllBids(this.userId);

	socket.emit(EVT_EMIT_JACKPOT_ME_JOINED, {
	    jackpotInfo:    {
	        uniqueId:    jackpot.uniqueId,
	        name:        jackpot.title,
	        amount:      convertAmountToCommaString(jackpot.JackpotAmount)
	    },
	    userInfo: {
	        name:               userInfo.name,
	        availableBids:      this.availableBids['jackpot'],
	        totalPlacedBids:    bidsByUser.length,
	    }
	});
}

JackpotUser.prototype.emitCanIBid = function()
{
	var socket 			= this.currentSocket,
		users 			= this.jackpot.users,
		minPlayers 		= this.jackpot.minPlayersRequired,
		lastBidUserId 	= this.jackpot.bidContainer.getLastBidUserId(),
		room 			= this.jackpot.getRoomName(),
		canIBid 		= false,
		namespace 		= global.ticktockGameState.jackpotSocketNs;

	if(users.length < minPlayers)
	{
		namespace.in(room).emit(EVT_EMIT_JACKPOT_CAN_I_BID, {canIBid: false});
	}
	else
	{
		socket.emit(EVT_EMIT_JACKPOT_CAN_I_BID, {
			canIBid: (lastBidUserId != this.userId)
		});
	}
}



/**
 * Bids Related Methods
 *
 */
JackpotUser.prototype.getAvailableBidsCount = function()
{
	return this.availableBids['jackpot'];
}

JackpotUser.prototype.getPlacedBidsCount = function()
{
	return this.placedBids['jackpot'].length;
}

JackpotUser.prototype.afterPlacedBid = function(bidContainer, parent, socket, bid)
{
	if(parent instanceof Jackpot)
	{
		this.afterPlacedJackpotBid(bidContainer, parent, socket, bid);
	}
	else if(parent instanceof NormalBattleLGame)
	{
		this.afterPlacedNormalBattleBid(bidContainer, parent, socket, bid);
	}
	else if(parent instanceof AdvanceBattleLGame)
	{
		this.afterPlacedAdvanceBattleBid(bidContainer, parent, socket, bid);
	}
}

JackpotUser.prototype.afterPlacedJackpotBid = function(bidContainer, parent, socket, bid)
{
	this.placedBids['jackpot'].push(bid);

	if(this.availableBids['jackpot'] > 0)
	{
		this.availableBids['jackpot'] -= 1;
	}

    socket.emit(EVT_EMIT_JACKPOT_MY_BID_PLACED, {
        availableBids:          this.availableBids['jackpot'],
        totalPlacedBids:        bidContainer.getTotalBidsCountByUserId(bid.userId),
        myLongestBidDuration:   bidContainer.getLongestBidDurationByUserId(bid.userId)
    });

    socket.emit(EVT_EMIT_JACKPOT_CAN_I_BID, {
		canIBid: false
	});
}

JackpotUser.prototype.afterPlacedNormalBattleBid = function(game, bid, socket)
{
	this.afterPlacedBattleBid(game, bid, socket, this.placedBids['normalBattle']);
}

JackpotUser.prototype.afterPlacedAdvanceBattleBid = function(game, bid, socket)
{
	this.afterPlacedBattleBid(game, bid, socket, this.placedBids['advanceBattle']);
}

JackpotUser.prototype.afterPlacedBattleBid = function(game, bid, socket, battleBids)
{
	// var normalBattleBids 	= this.placedBids[battleType],
	// 	battleLevel 		= game.level;

	// normalBattleBids.push({
	// 	id 		: battleLevel.id,
	// 	order	: battleLevel.order,
	// 	bid 	: bid
	// });
}

export default JackpotUser;