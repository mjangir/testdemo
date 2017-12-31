
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
  this.prizeValue               = data.prizeValue;
  this.minBidsToGamb 				    = data.minBidsToGamb;
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

/**
 * Is Level Locked For User
 *
 * @param  {BattleLevel}  previousLevel
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
BattleLevel.prototype.isLockedForUser = function(previousLevel, user)
{
	var minWinsToUnlockNext = previousLevel.minWinsToUnlockNext,
		totalWinnings 		    = user.getTotalNormalBattleWins(previousLevel);

	return totalWinnings < minWinsToUnlockNext;
}

/**
 * Get Prize Value
 * 
 * @returns {*}
 */
BattleLevel.prototype.getPrizeValue = function() {
  if(this.battleType == 'NORMAL') {
    return this.prizeValue;
  } else if(this.battleType == 'GAMBLING') {
    return this.minPlayersRequired * this.minBidsToGamb;
  }
}
export default BattleLevel;
