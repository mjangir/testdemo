'use strict'

import BattleLevel from '../common/battle-level';
import AdvanceBattleGame from './advance-battle-game';
import JackpotUser from '../jackpot/jackpot-user';

/**
 * AdvanceBattle Constructor
 *
 * @param {Jackpot} jackpot
 * @param {Object} data
 */
function AdvanceBattleLevel(jackpot, data)
{
	this.id 						= data.id;
	this.order 						= data.order;
	this.levelName 					= data.levelName;
	this.duration 					= data.duration;
	this.incrementSecondsOnBid 		= data.incrementSeconds;
	this.defaultAvailableBids 		= data.defaultAvailableBids;
	this.lastBidWinnerPercent 		= data.lastBidWinnerPercent;
	this.longestBidWinnerPercent 	= data.longestBidWinnerPercent;
	this.minPlayersRequired 		= data.minPlayersRequiredToStart;
	this.minBidsToGamb 				= data.minBidsToGamb;
	this.isLastLevel 				= data.isLastLevel;

	BattleLevel.call(this, jackpot, data);
}

AdvanceBattleLevel.prototype = Object.create(BattleLevel.prototype);

AdvanceBattleLevel.prototype.constructor = AdvanceBattleLevel;

/**
 * Is Level Locked For User
 *
 * @param  {BattleLevel}  previousLevel
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
AdvanceBattleLevel.prototype.isLockedForUser = function(previousLevel, user)
{
	return false;
}

/**
 * Is User Able To Join The Level
 *
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
AdvanceBattleLevel.prototype.isUserAbleToJoin = function(user)
{
	var userJackpotAvailableBids 	= user.getJackpotAvailableBids(),
		requiredAvailableBids 		= this.minBidsToGamb;

	return userJackpotAvailableBids >= requiredAvailableBids;
}

/**
 * Create New Game
 *
 * @return {BattleGame}
 */
AdvanceBattleLevel.prototype.createNewGame = function()
{
	var game = new AdvanceBattleGame(this);

	this.games.push(game);

	return game;
}

/**
 * Get Basic Info
 *
 * @return {Object}
 */
AdvanceBattleLevel.prototype.getBasicInfo = function()
{
	return {
        uniqueId    : this.uniqueId,
        levelName   : this.levelName
    };
}

export default AdvanceBattleLevel;