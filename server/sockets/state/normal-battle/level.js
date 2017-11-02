import sqldb from '../../../sqldb';
import LevelGame from './level-game';
import {generateRandomString} from '../../../utils/functions';

const JackpotBattleLevel = sqldb.JackpotBattleLevel;

/**
 * Constructor
 * @param {Container}
 * @param {data}
 */
function Level(container, data)
{
	this.uniqueId 		= generateRandomString(20, 'aA');
    this.levelContainer = container;
    this.jackpot        = container.jackpot;
    this.metaData       = data;
    this.games          = [];
    this.lastGame       = null;
}

Level.prototype.getAllGames = function()
{
	return this.games;
}

Level.prototype.getRunningGameByUser = function(jackpotUser)
{
	var games = this.games,
		game;

	if(games.length <= 0)
	{
		return false;
	}

	for(var k in games)
	{
		game = games[k];

		if((game.isNotStarted() && game.hasUser(jackpotUser)) || (game.isRunning() && game.hasUser(jackpotUser)))
		{
			return game;
		}
	}

	return false;
}

Level.prototype.getNewGameByUser = function(jackpotUser)
{
	var games 		= this.games,
		maxUsers 	= this.metaData.minPlayersRequiredToStart,
		game,
		returnGame;

	if(games.length <= 0)
	{
		returnGame = new LevelGame(this);
		returnGame.addUser(jackpotUser);
		this.games.push(returnGame);
		return returnGame;
	}
	else
	{
		for(var k in games)
		{
			game = games[k];
			if(game.getAllUsers().length < maxUsers)
			{
				game.addUser(jackpotUser);
				return game;
			}
		}
	}

	returnGame = new LevelGame(this);
	returnGame.addUser(jackpotUser);
	this.games.push(returnGame);
	return returnGame;
}

Level.prototype.findAllGamesByUser = function(userId)
{

}

Level.prototype.findLastGameByUser = function(userId)
{

}

Level.prototype.findFirstGameByUser = function(userId)
{

}

Level.prototype.findCurrentPlayingGameForUser = function(userId)
{

}

Level.prototype.getGameByUniqueId = function(uniqueId)
{
	var games = this.games,
        game;

    if(games.length <= 0)
    {
        return false;
    }

    for(var k in games)
    {
        game = games[k];

        if(game.gameId == uniqueId)
        {
            return game;
        }
    }

    return false;
}

Level.prototype.updateTimer = function()
{
	var games = this.games,
        game;

    if(games.length > 0)
    {
        for(var k in games)
        {
            game = games[k];
            game.updateTimer();
        }
    }
}

Level.prototype.getNumberOfWinsByUser = function(jackpotUser)
{
    var wins = 0;

    if(this.games.length > 0)
    {
        for(var k in this.games)
        {
            if(this.games[k].isUserWinner(jackpotUser))
            {
                wins += 1;
            }
        }
    }

    return wins;
}

Level.prototype.updateNewJackpotAmount = function(amount)
{
	if(this.games.length > 0)
    {
        for(var k in this.games)
        {
            this.games[k].updateNewJackpotAmount(amount)
        }
    }
}

Level.prototype.emitMainJackpotFinished = function()
{
	if(this.games.length > 0)
    {
        for(var k in this.games)
        {
            this.games[k].emitMainJackpotFinished()
        }
    }
}

export default Level;