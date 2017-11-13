'use strict'

import BattleLevel from '../common/battle-level';
import NormalBattleGame from './normal-battle-game';
import JackpotUser from '../jackpot/jackpot-user';
import {generateRandomString} from '../../../utils/functions';

/**
 * Normal Battle Level Constructor
 *
 * @param {Jackpot} jackpot
 * @param {Object} data
 */
function NormalBattleLevel(jackpot, data)
{
	BattleLevel.call(this, jackpot, data);

	this.id 						= data.id;
	this.order 						= data.order;
	this.levelName 					= data.levelName;
	this.duration 					= data.duration;
	this.incrementSecondsOnBid 		= data.incrementSeconds;
	this.prizeBids 					= data.prizeValue;
	this.defaultAvailableBids 		= data.defaultAvailableBids;
	this.lastBidWinnerPercent 		= data.lastBidWinnerPercent;
	this.longestBidWinnerPercent 	= data.longestBidWinnerPercent;
	this.minPlayersRequired 		= data.minPlayersRequiredToStart;
	this.minWinsToUnlockNext 		= data.minWinsToUnlockNextLevel;
	this.isLastLevel 				= data.isLastLevel;
}

NormalBattleLevel.prototype = Object.create(BattleLevel.prototype);

NormalBattleLevel.prototype.constructor = NormalBattleLevel;

/**
 * Is Level Locked For User
 *
 * @param  {BattleLevel}  previousLevel
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
NormalBattleLevel.prototype.isLockedForUser = function(previousLevel, user)
{
	var minWinsToUnlockNext = previousLevel.minWinsToUnlockNext,
		totalWinnings 		= user.getNormalBattleTotalWinnings(previousLevel);

	return totalWinnings < minWinsToUnlockNext;
}

/**
 * Is User Able To Join The Level
 *
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
NormalBattleLevel.prototype.isUserAbleToJoin = function(user)
{
	var jackpot 	= user.jackpot,
		order 		= this.order,
		prevOrder 	= Math.max(0, order - 1);

	if(prevOrder == 0)
	{
		return true;
	}
	else
	{
		var previousLevel 	= jackpot.getNormalBattleLevelByOrder(prevOrder),
			isLockedForUser = this.isLockedForUser(previousLevel, user);

		return isLockedForUser !== false;
	}
}

/**
 * Create New Game
 *
 * @return {BattleGame}
 */
NormalBattleLevel.prototype.createNewGame = function()
{
	var game = new NormalBattleGame(this);

	this.games.push(game);

	return game;
}

/**
 * Get Basic Info
 *
 * @return {Object}
 */
NormalBattleLevel.prototype.getBasicInfo = function()
{
	return {
        uniqueId    : this.uniqueId,
        levelName   : this.levelName,
        prizeValue  : this.prizeBids,
        prizeType   : 'BID'
    };
}

export default NormalBattleLevel;