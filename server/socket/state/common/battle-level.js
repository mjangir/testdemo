'use strict';

import {generateRandomString} from '../../../utils/functions';
import JackpotUser from '../jackpot/jackpot-user';
import _ from 'lodash';

function BattleLevel(jackpot, data)
{
	this.jackpot 	= jackpot;
	this.games 		= [];
	this.uniqueId 	= generateRandomString(20, 'aA');
}

BattleLevel.prototype.getAllGames = function()
{
	return this.games;
}

BattleLevel.prototype.getGameByUniqueId = function(uniqueId)
{
	return _.find(this.games, {uniqueId: uniqueId});
}

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

export default BattleLevel;