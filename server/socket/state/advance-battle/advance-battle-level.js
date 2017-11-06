'use strict'

import BattleLevel from '../common/battle-level';
import AdvanceBattleGame from './advance-battle-game';
import JackpotUser from '../jackpot/jackpot-user';
import {generateRandomString} from '../../../utils/functions';

function AdvanceBattleLevel(jackpot, data)
{
	this.id 						= data.id;
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
	this.minBidsToGamb 				= data.minBidsToGamb;
	this.isLastLevel 				= data.isLastLevel;

	this.games 						= [];

	BattleLevel.call(this, jackpot, data);
}

AdvanceBattleLevel.prototype = Object.create(BattleLevel.prototype);

AdvanceBattleLevel.prototype.constructor = AdvanceBattleLevel;

AdvanceBattleLevel.prototype.isLockedForUser = function(previousLevel, user)
{
	var minWinsToUnlockNext = previousLevel.minWinsToUnlockNext,
		totalWinnings 		= user.getNormalBattleTotalWinnings(previousLevel);

	return totalWinnings < minWinsToUnlockNext;
}

AdvanceBattleLevel.prototype.createNewGame = function()
{
	var game = new NormalBattleGame(this);

	this.games.push(game);

	return game;
}

export default AdvanceBattleLevel;