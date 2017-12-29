import BidContainer from './bid-container';
import TimeclockContainer from './timeclock-container';
import { generateRandomString } from '../../../utils/functions';
import _ from 'lodash';

/**
 * Game Constructor
 * 
 * @returns {*}
 */
function Game() {
	this.gameStatus = 'NOT_STARTED';
  this.uniqueId   = generateRandomString(20, 'aA');

  // Set Initial
  this.setBidContainer();
  this.setClockContainer();
  this.setRoomName();
}

/**
 * Set Clock Container
 * 
 * @returns {*}
 */
Game.prototype.setClockContainer = function() {
  this.timeclockContainer = new TimeclockContainer(this);
}

/**
 * Get Clock Container
 * 
 * @returns {TimeclockContainer}
 */
Game.prototype.getClockContainer = function() {
  return this.timeclockContainer;
}

/**
 * Set Bid Container
 * 
 * @returns {*}
 */
Game.prototype.setBidContainer = function() {
  this.bidContainer = new BidContainer(this);
}

/**
 * Get Bid Container
 * 
 * @returns {BidContainer}
 */
Game.prototype.getBidContainer = function() {
  return this.bidContainer;
}

/**
 * Set Clock
 * 
 * @param {String} name 
 * @param {Integer} time 
 * @returns {*}
 */
Game.prototype.setClock = function(name, time) {
  this.timeclockContainer.setClock(name, time);
}

/**
 * Get Clock By Name
 * 
 * @param {String} name 
 * @returns {Timeclock}
 */
Game.prototype.getClock = function(name) {
  return this.timeclockContainer.getClock(name);
}

/**
 * Set Room Name
 * 
 * @returns {*}
 */
Game.prototype.setRoomName = function() {
  this.roomName = 'GAME_ROOM_' + this.uniqueId;
}

/**
 * Get Room Name
 * 
 * @returns {String}
 */
Game.prototype.getRoomName = function() {
  return this.roomName;
}

/**
 * Get Remaining Time By Clock
 * 
 * @param {Integer} clock 
 */
Game.prototype.getRemainingTime = function(clock) {
  return this.getClock(clock).remaining;
}

/**
 * Get Elapsed Time By Clock
 * 
 * @param {Integer} clock 
 */
Game.prototype.getElapsedTime = function(clock) {
  return this.getClock(clock).elapsed;
}

/**
 * Get Unique ID
 * 
 * @returns {String}
 */
Game.prototype.getUniqueId = function() {
  return this.uniqueId;
}

/**
 * Get Game Status
 * 
 * @returns {String}
 */
Game.prototype.getGameStatus = function() {
  return this.gameStatus;
}

/**
 * Is Game Running
 * 
 * @returns {Boolean}
 */
Game.prototype.isStarted = function() {
  return this.getGameStatus() === 'STARTED';
}

/**
 * Is Game Finished
 * 
 * @returns {Boolean}
 */
Game.prototype.isFinished = function() {
  return this.getGameStatus() === 'FINISHED';
}

/**
 * Is Game Not Started Yet
 * 
 * @returns {Boolean}
 */
Game.prototype.isNotStarted = function() {
  return this.getGameStatus() === 'NOT_STARTED';
}

/**
 * Count Down All Clocks Of The Game
 * 
 * @returns {*}
 */
Game.prototype.countDown = function() {
  this.timeclockContainer.countDown();
}

/**
 * Is User Bid Consecutive
 * 
 * @param {JackpotUser} user
 * @returns {Boolean}
 */
Game.prototype.isUserBidConsecutive = function(user) {
  return user.userId == this.bidContainer.getLastBidUserId();
}

Game.prototype.finish = function() {
  
}

export default Game;
