import Game from '../common/game';

/**
 * Battle Game
 * 
 */
function BattleGame(parent) {
  this.parent = parent;
  this.setTimeclocks();
}

/**
 * Set Time Clocks
 * 
 * @returns {*}
 */
BattleGame.prototype.setTimeclocks = function() {
  this.setClock('game', this.parent.duration);
}

/**
 * Get Battle Game Header Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getGameHeaderInfo = function() {
  return {
    name      : this.parent.getName(),
    prize     : this.parent.getPrizeValue(),
    gameClock : this.getClock('game').getFormattedRemaining()
  };
}

/**
 * Get Bid Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getBidInfo = function() {
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
    myBattleBids : user.getBattleAvailableBids()
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
