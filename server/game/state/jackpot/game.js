import Game from '../common/game';
import JackpotUser from './jackpot-user';
import _ from 'lodash';
import { convertAmountToCommaString } from '../../../utils/functions';
import updateHomeScreen from '../../utils/emitter/update-home-screen';
import { 
  HOME_SCREEN_SCENE_GAME,
  HOME_SCREEN_COMPONENT_HEADER,
  HOME_SCREEN_COMPONENT_BIDS
} from '../../constants';

/**
 * Jackpot Game
 * 
 */
function JackpotGame(parent) {
  Game.call(this);
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

  this.setClock('game', jackpot.gameDuration);
  this.setClock('doomsday', jackpot.doomsdayDuration);
  
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
  return _.find(this.users, {userId: String(userId)}) || false;
}

/**
 * Add User By ID
 * 
 * @param {JackpotUser} userId 
 */
JackpotGame.prototype.addUserById = function(userId) {
  var user = new JackpotUser(this, userId);
  this.users.push(user);
  return user;
}

/**
 * Is Bid Button Visible
 * 
 * @param {JackpotUser} user 
 * @returns {Object}
 */
JackpotGame.prototype.isBidButtonVisible = function(user) {
  var minPlayersRequired  = this.parent.minPlayersRequired,
      totalUsers          = this.getAllUsers().length,
      lastBidUserId       = this.bidContainer.getLastBidUserName(),
      userId              = user.userId;
    
  return (lastBidUserId != userId && totalUsers >= minPlayersRequired);
}

/**
 * Is Quit Button Visible
 * 
 * @returns {Object}
 */
JackpotGame.prototype.isQuitButtonVisible = function() {
  return this.isDoomsDayOver();
}

/**
 * Get Average Bid Bank
 * 
 * @returns {Number}
 */
JackpotGame.prototype.getAverageBidBank = function() {
  var remaining = this.getRemainingPlayers(),
      bids      = 0;

  for(var k in remaining) {
    bids += remaining[k].getJackpotAvailableBids();
  }
  
  return bids != 0 && remaining.length != 0 ? Math.round(bids/remaining.length) : 0;
}

/**
 * Get Remaining Players
 * 
 * @returns {Array}
 */
JackpotGame.prototype.getRemainingPlayers = function() {
  var users   = this.getAllUsers(),
      result  = [],
      user;

    for(var i in users) {
      user = users[i];
      if(user.gameStatus != 'QUITTED' || user.gameStatus != 'ELIMINATED') {
        result.push(user);
      }
    }

    return result;
}

/**
 * Get Active Players
 * 
 * @returns {Array}
 */
JackpotGame.prototype.getActivePlayers = function() {
  var remaining = this.getRemainingPlayers(),
      result    = [];

  for(var k in remaining) {
    if(remaining[k].isActive) {
      result.push(remaining[k]);
    }
  }

  return result;
}

/**
 * Get Game Header Info
 * 
 * @returns {Object}
 */
JackpotGame.prototype.getGameHeaderInfo = function() {
  return {
    uniqueId      : this.parent.uniqueId,
    name          : this.parent.title,
    amount        : convertAmountToCommaString(this.parent.amount),
    gameClock     : this.getClock('game').getFormattedRemaining(),
    doomsdayClock : this.getClock('doomsday').getFormattedRemaining()
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
    playersRemaining    : this.getRemainingPlayers().length,
    activePlayers       : this.getActivePlayers().length,
    averageBidBank      : this.getAverageBidBank()
  };
}

/**
 * Get User Info
 * 
 * @param {JackpotUser} user 
 * @returns {Object}
 */
JackpotGame.prototype.getUserInfo = function(user) {
  return {
    bidBank       : user.getJackpotAvailableBids(),
    myLongestBid  : user.getLongestBidDuration(),
    battlesWon    : user.getTotalBattleWins(),
    battleStreak  : user.getCurrentBattleStreak()
  }
}

/**
 * Get Home Buttons Info
 * 
 * @param {JackpotUser} user 
 * @returns {Object}
 */
JackpotGame.prototype.getUserHomeButtonsInfo = function(user) {
  return {
    showBidButton: this.isBidButtonVisible(user),
    showQuitButton: this.isQuitButtonVisible(),
  };
}

/**
 * Start Game
 * 
 * @returns {*}
 */
JackpotGame.prototype.startGame = function()
{
    this.gameStatus = 'STARTED';
    this.startedOn  = new Date();
    this.updateStatusInDB('STARTED');
}

/**
 * Update Status In Database
 * 
 * @param {String} status
 * @returns {*}
 */
JackpotGame.prototype.updateStatusInDB = function(status)
{
    this.parent.updateStatusInDB(status);
}

/**
 * Run Every Second
 */
Game.prototype.runEverySecond = function() {
  if(this.getClock('game').remaining > 0 && this.gameStatus == 'STARTED') {
    this.countDown();
    updateHomeScreen(this, HOME_SCREEN_SCENE_GAME, [HOME_SCREEN_COMPONENT_HEADER, HOME_SCREEN_COMPONENT_BIDS]);
  }
}

export default JackpotGame;
