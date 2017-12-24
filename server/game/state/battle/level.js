
/**
 * Battle Level
 * 
 */
function BattleLevel(jackpot, data) {
  this.jackpot                  = jackpot;
  this.id 						          = data.id;
  this.uniqueId                 = data.uniqueId,
  this.title 					          = data.levelName;
  this.minPlayersRequired 		  = data.minPlayersRequiredToStart;
  this.gameDuration 					  = data.duration;
	this.increaseSecondsOnBid 		= data.incrementSeconds;
	this.defaultAvailableBids 		= data.defaultAvailableBids;
	this.lastBidWinnerPercent 		= data.lastBidWinnerPercent ? data.lastBidWinnerPercent : 50;
	this.longestBidWinnerPercent 	= data.longestBidWinnerPercent ? data.longestBidWinnerPercent : 50;
	this.minWinsToUnlockNext 		  = data.minWinsToUnlockNextLevel;
  this.isLastLevel 				      = data.isLastLevel;
  this.order 						        = data.order;
  this.battleType               = data.battleType;
  this.games                    = [];
}

/**
 * Run Every Seconds
 */
BattleLevel.prototype.runEverySecond = function() {
  for(var k in this.games) {
    this.games[k].runEverySecond();
  }
}

export default BattleLevel;
