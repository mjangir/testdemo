'use strict'

import BattleLevel from '../battle-level';

function NormalBattleLevel(data)
{
	this.id 						= data.id,
	this.order 						= data.order;
	this.levelName 					= data.levelName;
	this.duration 					= data.duration;
	this.durationRemaining 			= data.duration;
	this.incrementSecondsOnBid 		= data.incrementSeconds;
	this.prizeBids 					= data.prizeValue;
	this.defaultAvailableBids 		= data.defaultAvailableBids;
	this.lastBidWinnerPercent 		= data.lastBidWinnerPercent;
	this.longestBidWinnerPercent 	= data.longestBidWinnerPercent;
	this.minPlayersRequired 		= data.minPlayersRequiredToStart;
	this.minWinsToUnlockNext 		= data.minWinsToUnlockNextLevel;

	this.games 						= [];
}

NormalBattleLevel.prototype = Object.create(BattleLevel.prototype);

export default NormalBattleLevel;