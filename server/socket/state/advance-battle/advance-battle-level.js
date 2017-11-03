'use strict'

import BattleLevel from '../common/battle-level';

function AdvanceBattleLevel(data)
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

AdvanceBattleLevel.prototype = Object.create(BattleLevel.prototype);

export default AdvanceBattleLevel;