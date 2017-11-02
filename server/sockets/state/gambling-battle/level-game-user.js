import sqldb from '../../../sqldb';

/**
 * Constructor
 * @param {data}
 */
function LevelGameUser(levelGame, jackpotUser, gamblingBids)
{
	this.game 			= levelGame,
    this.jackpotUser   	= jackpotUser;
    this.isActive   	= true;
    this.gameStatus 	= 'JOINED';
    this.joinedOn   	= new Date();
    this.bids 			= [];
    this.availableBids 	= this.game.level.metaData.defaultAvailableBids;
    this.bidsForGambling= gamblingBids;
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