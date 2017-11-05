'use strict';

import {generateRandomString} from '../../../utils/functions';
import JackpotUser from '../jackpot/jackpot-user';
import BattleGame from './battle-game';

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

BattleLevel.prototype.countDown = function()
{
	if(this.games.length > 0)
	{
		for(var k in this.games)
		{
			this.games[k].countDown();
		}
	}
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

BattleLevel.prototype.finishGameEverySecond = function()
{

}

export default BattleLevel;