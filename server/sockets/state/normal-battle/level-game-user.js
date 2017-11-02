import sqldb from '../../../sqldb';

/**
 * Constructor
 * @param {data}
 */
function LevelGameUser(levelGame, jackpotUser, socket)
{
	this.game 			= levelGame,
    this.jackpotUser   	= jackpotUser;
    this.isActive   	= true;
    this.gameStatus 	= 'JOINED';
    this.joinedOn   	= new Date();
    this.bids 			= [];
    this.socket 		= socket;
    this.availableBids 	= this.game.level.metaData.defaultAvailableBids;
}

LevelGameUser.prototype.getAllBids = function()
{
	return this.bids;
}

LevelGameUser.prototype.decreaseAvailableBids = function()
{
	this.availableBids -= 1;
}

export default LevelGameUser;