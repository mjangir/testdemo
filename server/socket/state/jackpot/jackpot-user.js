'use strict';

import { 
	EVT_EMIT_JACKPOT_CAN_I_BID,
	EVT_EMIT_JACKPOT_GAME_JOINED,
	EVT_EMIT_JACKPOT_BID_PLACED,
	EVT_EMIT_NORMAL_BATTLE_JOINED,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID
} from '../../constants';

import { 
	convertAmountToCommaString, 
	getUserObjectById 
} from '../../../utils/functions';

import Jackpot from './jackpot';
import NormalBattleLGame from '../normal-battle/normal-battle-game';
import AdvanceBattleLGame from '../advance-battle/advance-battle-game';
import _ from 'lodash';

function JackpotUser(jackpot, userId)
{
	this.userId 				= userId;
	this.jackpot 				= jackpot;
	this.joinedOn 				= new Date();
	this.isActive 				= true;
	this.userGameStatus 		= 'PLAYING';

	this.availableBids = {
		'jackpot' 		: 0,
		'normalBattle' 	: {},
		'advanceBattle' : {}
	};

	this.placedBids = {
		'jackpot' 		: [],
		'normalBattle' 	: {},
		'advanceBattle' : {}
	};

	this.battleWins = {
		'normalBattle' 	: [],
		'advanceBattle' : []
	};
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

	socket.emit(EVT_EMIT_JACKPOT_GAME_JOINED, {
	    jackpotInfo:    {
	        uniqueId:    jackpot.uniqueId,
	        name:        jackpot.title,
	        amount:      convertAmountToCommaString(jackpot.jackpotAmount)
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

JackpotUser.prototype.emitMeJoinedNormalBattle = function(socket, level, game, data)
{
	socket.emit(EVT_EMIT_NORMAL_BATTLE_JOINED, {
        jackpotInfo:    {
            uniqueId:    this.jackpot.uniqueId,
            name:        this.jackpot.title,
            amount:      convertAmountToCommaString(this.jackpot.jackpotAmount)
        },
        levelInfo: {
            uniqueId    : level.uniqueId,
            levelName   : level.levelName,
            prizeValue  : level.prizeBids,
            prizeType   : 'BID'
        },
        myInfo: {
            userId 			: this.userId,
            name 			: getUserObjectById(this.userId).name,
            availableBids 	: this.getNormalBattleAvailableBids(level, game),
            totalPlacedBids : this.getNormalBattlePlacedBids(level, game).length
        },
        gameInfo: {
            duration : game.getClock('game').getFormattedRemaining(),
            uniqueId : game.uniqueId
        },
        players             : game.getAllPlayersList(),
        currentBidDuration 	: game.bidContainer.getLastBidDuration(true),
        currentBidUser 		: game.bidContainer.getLastBidUserName(),
        longestBidDuration 	: game.bidContainer.getLongestBidDuration(true),
        longestBidUser  	: game.bidContainer.getLongestBidUserName()
    });
}

JackpotUser.prototype.emitMyBattlePlaceBidButtonToggle = function(socket, level, game, data)
{
	var gameNotStarted 	= game.isNotStarted(),
		lastBidUserId 	= game.bidContainer.getLastBidUserId();

	if(gameNotStarted || (lastBidUserId != null && lastBidUserId == this.userId))
	{
		socket.emit(EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID);
	}
	else
	{
		socket.emit(EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID);
	}
}

JackpotUser.prototype.getNormalBattleAvailableBids = function(level, game)
{
	return this.availableBids['normalBattle'][level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.getNormalBattlePlacedBids = function(level, game)
{
	return this.placedBids['normalBattle'][level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.getAdvanceBattleAvailableBids = function(level, game)
{
	return this.availableBids['advanceBattle'][level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.getAdvanceBattlePlacedBids = function(level, game)
{
	return this.placedBids['advanceBattle'][level.uniqueId][game.uniqueId];
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

    socket.emit(EVT_EMIT_JACKPOT_BID_PLACED, {
        availableBids:          this.availableBids['jackpot'],
        totalPlacedBids:        this.placedBids['jackpot'].length,
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

JackpotUser.prototype.afterPlacedBattleBid = function(game, bid, socket, placeBids)
{
	var level 			= game.level,
		levelUniqueId 	= level.uniqueId,
		gameUniqueId 	= game.uniqueId,
		availableBids 	= this.getNormalBattleAvailableBids(level, game);

	placeBids[levelUniqueId][gameUniqueId].push(bid);

	if(availableBids > 0)
	{
		availableBids -= 1;
	}

	// var normalBattleBids 	= this.placedBids[battleType],
	// 	battleLevel 		= game.level;

	// normalBattleBids.push({
	// 	id 		: battleLevel.id,
	// 	order	: battleLevel.order,
	// 	bid 	: bid
	// });
}

JackpotUser.prototype.getNormalBattleTotalWinnings = function(level)
{
	var allWins 	= this.battleWins['normalBattle'],
		uniqueId 	= level.uniqueId,
		levelWins 	= _.filter(allWins, function(o)
		{ 
		    return o.levelUniqueId == uniqueId; 
		});

	return levelWins.length;
}

export default JackpotUser;