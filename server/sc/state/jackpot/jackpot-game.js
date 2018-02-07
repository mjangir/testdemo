import Game from '../common/game';

/**
 * Jackpot Game
 * 
 */
function JackpotGame(parent) {
  this.parent = parent;
  this.setTimeclocks();
}

/**
 * Set Time Clocks
 * 
 * @returns {*}
 */
JackpotGame.prototype.setTimeclocks = function() {
  var jackpot = this.parent;

  this.setClock('game', jackpot.gameClockDuration);
  this.setClock('doomsday', jackpot.doomsdayClockDuration);
  
  if(jackpot.secondsToIncreaseAmount && jackpot.increaseAmount) {
      this.getClock('game').runEveryXSecond(jackpot.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
  }
}

/**
 * Update Jackpot Amount
 * 
 * @returns {*}
 */
JackpotGame.prototype.updateJackpotAmount = function() {
  var jackpot = this.parent;

  jackpot.jackpotAmount = Number(parseFloat(jackpot.jackpotAmount, 10) + parseFloat(jackpot.increaseAmount, 10)).toFixed(2);
}

/**
 * Is Dooms Day Clock Over
 * 
 * @returns {Boolean}
 */
JackpotGame.prototype.isDoomsDayOver = function()
{
  return this.getClock('doomsday').remaining == 0;
}

/**
 * Get Application Header Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getJackpotHeaderInfo = function() {
  return {
    name          : this.parent.title,
    amount        : this.parent.jackpotAmount,
    gameClock     : this.getClock('game').getFormattedRemaining(),
    doomsdayClock : this.getClock('doomsday').getFormattedRemaining(),
  };
}

/**
 * Get Bid Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getBidInfo = function() {
  return {
    currentBidDuration  : this.bidContainer.getLastBidDuration(true),
    currentBidUser      : this.bidContainer.getLastBidUserName(),
    longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
    longestBidUser      : this.bidContainer.getLongestBidUserName(),
  }
}

/**
 * Get Players Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getPlayersInfo = function() {
  return {
    playersRemaining    : this.getPlayersRemaining(),
    activePlayers       : this.getActivePlayers(),
    averageBidBank      : this.getAverageBidBank()
  };
}

/**
 * Get User Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getUserInfo = function(user) {
  return {
    bidBank       : user.getJackpotAvailableBids(),
    myLongestBid  : user.getLongestBidDuration(),
    battlesWon    : user.getTotalBattleWins(),
    battleStreak  : user.getTotalBattleStreak()
  }
}

/**
 * Get Battle Levels
 * 
 * @returns {Array}
 */
JackpotGame.prototype.getBattleLevels = function(user) {
  if(this.isDoomsDayOver()) {
    return this.parent.getNormalBattleLevels(user);
  } else {
    return this.parent.getAdvanceBattleLevels(user);
  }
}

/**
 * Get Winner Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getWinnerInfo = function() {
  
}


JackpotGame.prototype = Object.create(Game.prototype);
