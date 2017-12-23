import Game from '../common/game';
import JackpotUser from './jackpot-user';

/**
 * Jackpot Game
 * 
 */
function JackpotGame(parent) {
  this.parent = parent;
  this.users  = [];
  this.setTimeclocks();
}

JackpotGame.prototype = Object.create(Game.prototype);

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

  jackpot.amount = Number(parseFloat(jackpot.amount, 10) + parseFloat(jackpot.increaseAmount, 10)).toFixed(2);
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
 * Is Game Clock Over
 * 
 * @returns {Boolean}
 */
JackpotGame.prototype.isGameClockOver = function()
{
  return this.getClock('game').remaining == 0;
}

/**
 * Get All Users
 * 
 * @returns {Array}
 */
JackpotGame.prototype.getAllUsers = function() {
  return this.users;
}

/**
 * Get User By ID
 * 
 * @param {JackpotUser} userId 
 */
JackpotGame.prototype.getUserById = function(userId) {
  return _.find(this.users, {userId: userId}) || false;
}

/**
 * Add User By ID
 * 
 * @param {JackpotUser} userId 
 */
JackpotGame.prototype.addUserById = function(userId) {
  var user = new JackpotUser(this, userId);
  user.afterJoinJackpotGame();
  return user;
}

/**
 * Get Game Header Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getGameHeaderInfo = function() {
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
