'use strict';

import {generateRandomString} from '../../../utils/functions';
import JackpotUser from '../jackpot/jackpot-user';
import _ from 'lodash';

/**
 * BattleLevel Constructor
 *
 * @param {Jackpot} jackpot
 * @param {Object} data
 */
function BattleLevel(jackpot, data)
{
	this.jackpot 	= jackpot;
	this.games 		= [];
	this.uniqueId 	= generateRandomString(20, 'aA');
}

/**
 * Get All Games
 *
 * @return {Array}
 */
BattleLevel.prototype.getAllGames = function()
{
	return this.games;
}

/**
 * Get Game By Unique ID
 *
 * @param  {String} uniqueId
 * @return {BattleGame|undefined}
 */
BattleLevel.prototype.getGameByUniqueId = function(uniqueId)
{
	return _.find(this.games, {uniqueId: uniqueId});
}

/**
 * Get Available Game Slot
 *
 * @return {BattleGame}
 */
BattleLevel.prototype.getAvailableGameSlot = function()
{
	var games = this.games,
		users,
		minPlayers;

	if(games.length > 0)
	{
		for(var k in games)
		{
			users 		= games[k].getAllUsers(),
			minPlayers 	= this.minPlayersRequired;

			if(users.length < minPlayers)
			{
				return games[k];
			}
		}
	}

	return false;
}

/**
 * Update Jackpot Amount On All Games
 *
 * @return {*}
 */
BattleLevel.prototype.updateJackpotAmount = function()
{
	if(this.games.length > 0)
	{
		for(var k in this.games)
		{
			this.games[k].updateJackpotAmount();
		}
	}
}

/**
 * Fire On Every Second
 *
 * @return {*}
 */
BattleLevel.prototype.fireOnEverySecond = function()
{
	if(this.games.length > 0)
	{
		for(var k in this.games)
		{
			this.games[k].countDown();
			this.games[k].finishGame();
			this.games[k].emitTimerUpdates();
		}
	}
}

BattleLevel.prototype.getLastBidWinnerPrize = function()
{
	var prizeValue 	= this.getPrizeValue(),
		percent 	= parseFloat(this.lastBidWinnerPercent, 10),
		percent 	= !isNaN(percent) ? percent : 100;

	return parseInt((percent/100 * prizeValue), 10);
}

BattleLevel.prototype.getLongestBidWinnerPrize = function()
{
	var prizeValue 	= this.getPrizeValue(),
		percent 	= parseFloat(this.longestBidWinnerPercent, 10),
		percent 	= !isNaN(percent) ? percent : 100;

	return parseInt((percent/100 * prizeValue), 10);
}

BattleLevel.prototype.getSingleWinnerPrize = function()
{
	return this.getPrizeValue();
}

BattleLevel.prototype.hasUserExistingGame = function(user)
{
  var games = this.getAllGames(),
      game  = false;

	if(games.length > 0)
	{
		for(var k in games)
    {
      if(games[k].getUser(user) && (games[k].isStarted() || games[k].isNotStarted()))
      {
        game = games[k];
        break;
      }
    }
	}

  return game;
}

export default BattleLevel;
