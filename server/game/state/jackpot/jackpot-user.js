import Jackpot from './jackpot';
import JackpotGame from './game';
import BattleGame from '../battle/game';
import _ from 'lodash';

/**
 * Constructor
 *
 * @param {Jackpot} jackpotGame
 * @param {Integer} userId
 */
function JackpotUser(jackpotGame, userId) {
	this.userId 	    = userId;
  this.jackpot 	    = jackpotGame.parent;
  this.jackpotGame  = jackpotGame;
	this.joinedOn     = new Date();
	this.isActive     = true;
  this.gameStatus   = 'PLAYING';
  
  this.availableBids = {
    jackpot: 0,
    battle: {}
  };

  this.placedBids = {
    jackpot: [],
    battle: {}
  };

  this.battleWins = [];

  this.setJackpotDefaultAvailableBids();
  this.setJackpotDefaultPlacedBids();
}

/**
 * Is Quitted
 * 
 * @returns {Boolean}
 */
JackpotUser.prototype.isQuitted = function() {
  return this.gameStatus == 'QUITTED';
}

/**
 * Is Bid Button Visible
 * 
 * @returns {Boolean}
 */
JackpotUser.prototype.isQuitButtonVisible = function() {
  return this.jackpotGame.isDoomsDayOver();
}

/**
 * Set Jackpot Default Available Bids
 *
 * @return {*}
 */
JackpotUser.prototype.setJackpotDefaultAvailableBids = function() {
  this.availableBids.jackpot = this.jackpot.defaultAvailableBids;
}

/**
 * Set Battle Default Avaiable Bids
 *
 * @param {BattleLevel} level
 * @param {BattleGame} game
 * @returns {*}
 */
JackpotUser.prototype.setBattleDefaultAvailableBids = function(level, game) {
    var availableBids = this.availableBids.battle;

    if(!availableBids.hasOwnProperty(level.uniqueId))
    {
        availableBids[level.uniqueId] = {};
    }
    if(!availableBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        availableBids[level.uniqueId][game.uniqueId] = level.defaultAvailableBids;
    }
}

/**
 * Set Jackpot Default Avaiable Bids
 *
 * @param {Number} bids
 * @returns {*}
 */
JackpotUser.prototype.setJackpotAvailableBids = function(bids) {
  this.availableBids.jackpot = bids;
}

/**
 * Set Battle Avaiable Bids
 *
 * @param {BattleLevel} level
 * @param {BattleGame} game
 * @param {Number} bids
 * @returns {*}
 */
JackpotUser.prototype.setBattleAvailableBids = function(level, game, bids) {
  this.availableBids.battle[level.uniqueId][game.uniqueId] = bids;
}

/**
 * Get Jackpot Available Bids
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getJackpotAvailableBids = function() {
  return this.availableBids.jackpot;
}

/**
 * Get Battle Available Bids
 * 
 * @param {BattleLevel} level
 * @param {BattleGame} game
 * @returns {Number}
 */
JackpotUser.prototype.getBattleAvailableBids = function(level, game) {
  return this.availableBids.battle[level.uniqueId][game.uniqueId];
}

/**
 * Set Jackpot Default Placed Bids
 * 
 * @returns {*}
 */
JackpotUser.prototype.setJackpotDefaultPlacedBids = function() {
  this.placedBids.jackpot = [];
}

/**
 * Set Battle Default Placed Bids
 * @param {BattleLevel} level 
 * @param {BattleGame} game 
 * @returns {*}
 */
JackpotUser.prototype.setBattleDefaultPlacedBids = function(level, game) {
  var placedBids = this.placedBids.battle;
  
  if(!placedBids.hasOwnProperty(level.uniqueId))
  {
    placedBids[level.uniqueId] = {};
  }
  if(!placedBids[level.uniqueId].hasOwnProperty(game.uniqueId))
  {
    placedBids[level.uniqueId][game.uniqueId] = [];
  }
}

/**
 * Get Jackpot Placed Bids
 * 
 * @returns {Array}
 */
JackpotUser.prototype.getJackpotPlacedBids = function() {
  return this.placedBids.jackpot;
}

/**
 * Get Jackpot Placed Bids
 * 
 * @param {BattleLevel} level
 * @param {BattleGame} game
 * @returns {Array}
 */
JackpotUser.prototype.getBattlePlacedBids = function(level, game) {
  return this.placedBids.battle[level.uniqueId][game.uniqueId];
}

/**
 * Increase Jackpot Available Bids
 * 
 * @param {Number} count
 * @returns {*}
 */
JackpotUser.prototype.increaseJackpotAvailableBids = function(count) {
  var availableBids = this.getJackpotAvailableBids();

  availableBids += count || 1;

  this.setJackpotAvailableBids(availableBids);
}

/**
 * Increase Battle Available Bids
 * 
 * @param {BattleLevel} level
 * @param {BattleGame} game
 * @param {Number} count
 * @returns {*}
 */
JackpotUser.prototype.increaseBattleAvailableBids = function(level, game, count) {
  var availableBids = this.getBattleAvailableBids(level, game);
  
  availableBids += count || 1;

  this.setBattleAvailableBids(level, game, availableBids);
}

/**
 * Decrease Jackpot Available Bids
 * 
 * @param {Number} count
 * @returns {*}
 */
JackpotUser.prototype.decreaseJackpotAvailableBids = function(count) {
  var availableBids = this.availableBids.jackpot;

  if(availableBids > 0) {
    availableBids -= count || 1;
  }

  this.setJackpotAvailableBids(availableBids);
}

/**
 * Decrease Battle Available Bids
 * 
 * @param {BattleLevel} level 
 * @param {BattleGame} game 
 * @param {Number} count 
 * @returns {*}
 */
JackpotUser.prototype.decreaseBattleAvailableBids = function(level, game, count) {
  var availableBids = this.getBattleAvailableBids(level, game);
  
  availableBids -= count || 1;

  this.setBattleAvailableBids(level, game, availableBids);
}

/**
 * Push New Jackpot Placed Bid
 * 
 * @param {Bid} bid 
 */
JackpotUser.prototype.increaseJackpotPlacedBids = function(bid) {
  this.getJackpotPlacedBids().push(bid);
}

/**
 * Push New Battle Placed Bid
 * 
 * @param {BattleLevel} level 
 * @param {BattleGame} game 
 * @param {Bid} bid 
 * @returns {*}
 */
JackpotUser.prototype.increaseBattlePlacedBids = function(level, game, bid) {
  this.getBattlePlacedBids(level, game).push(bid);
}

/**
 * After Place Bid
 * 
 * @param {BidContainer} bidContainer 
 * @param {BattleGame|JackpotGame} game 
 * @param {Socket} socket 
 * @param {Bid} bid 
 * @returns {*}
 */
JackpotUser.prototype.afterPlacedBid = function(bidContainer, game, socket, bid) {
  if(game instanceof JackpotGame)
  {
    this.decreaseJackpotAvailableBids();
    this.increaseJackpotPlacedBids(bid);
  }
  else if(game instanceof BattleGame)
  {
    this.decreaseBattleAvailableBids(game.parent, game);
    this.increaseBattlePlacedBids(game.parent, game, bid);
  }
}

/**
 * After Battle Game Finished
 * 
 * @param {BattleGame} game 
 * @param {BattleLevel} level 
 * @param {String} status 
 * @param {String} prize 
 * @returns {*}
 */
JackpotUser.prototype.afterBattleGameFinished = function(game, level, status, prize) {
  var winsArr = this.battleWins;

  if(status == 'WINNER') {
    this.increaseJackpotAvailableBids(prize);
  }

  this.battleWins.push({
    gameUniqueId    : game.uniqueId,
    levelUniqueId   : level.uniqueId,
    winningStatus   : status,
    battleType      : level.battleType
  });
}

/**
 * Get Battle Streak Data
 * 
 * @param {Array} input 
 * @returns {Array}
 */
JackpotUser.prototype.getBattleStreakData = function(input) {
  var output = [];

  for(var k in input) {
    if (!output[output.length-1] || output[output.length-1].value != input[k].winningStatus) {
      output.push({value: input[k].winningStatus, times: 1})
    } else {
      output[output.length-1].times++;
    }
  }

  return _.filter(output, {value: 'WINNER'});
}

/**
 * Get Current Battle Streak
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getCurrentBattleStreak = function() {
  var bothBattleWins    = this.battleWins,
      battleStreakData  = this.getBattleStreakData(bothBattleWins);

  if(bothBattleWins.length == 0 || bothBattleWins[bothBattleWins.length - 1].winningStatus == 'LOOSER') {
    return 0;
  }

  if(battleStreakData.length == 0) {
    return 0;
  }

  return battleStreakData[battleStreakData.length - 1]['times'];
}

/**
 * Get Longest Battle Streak
 * 
 * @param {Array} input 
 * @returns {Number}
 */
JackpotUser.prototype.getLongestBattleStreak = function(input) {
  var streakData;

  if(input.length == 0 || input[input.length - 1].winningStatus == 'LOOSER') {
    return 0;
  }

  streakData = this.getBattleStreakData(input);

  if(streakData.length == 0) {
    return 0;
  }

  return _.max(streakData.map(function(a) {
		return a.times;
	}));
}

/**
 * Get Normal Battle Longest Streak
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getNormalBattleLongestStreak = function() {
  return this.getLongestBattleStreak(_.filter(this.battleWins, {battleType: 'NORMAL'}));
}

/**
 * Get Advance Battle Longest Streak
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getAdvanceBattleLongestStreak = function() {
  return this.getLongestBattleStreak(_.filter(this.battleWins, {battleType: 'ADVANCE'}));
}

/**
 * Get Total Normal Battle Wins
 * 
 * @param {Level} level
 * @returns {Number}
 */
JackpotUser.prototype.getTotalNormalBattleWins = function(level) {
  var wins    = _.filter(this.battleWins, {battleType: 'NORMAL'});
  var records = wins ? wins.filter(function(item) {
    if(typeof level != 'undefined') {
      return item.winningStatus == 'WINNER' && item.levelUniqueId == level.uniqueId;
    } else {
      return item.winningStatus == 'WINNER';
    }
  }) : [];

  return records.length;
}

/**
 * Get Total Advance Battle Wins
 * 
 * @param {Level} level
 * @returns {Number}
 */
JackpotUser.prototype.getTotalAdvanceBattleWins = function(level) {
  var wins    = _.filter(this.battleWins, {battleType: 'ADVANCE'});
  var records = wins ? wins.filter(function(item) {
    if(typeof level != 'undefined') {
      return item.winningStatus == 'WINNER' && item.levelUniqueId == level.uniqueId;
    } else {
      return item.winningStatus == 'WINNER';
    }
  }) : [];

  return records.length;
}

/**
 * Get Total Battle Wins
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getTotalBattleWins = function() {
  return this.getTotalNormalBattleWins() + this.getTotalAdvanceBattleWins();
}

/**
 * Get Total Normal Battle Looses
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getTotalNormalBattleLooses = function() {
  var wins = _.filter(this.battleWins, {battleType: 'NORMAL'});

  var records = wins ? wins.filter(function(item) {
    return item.winningStatus == 'LOOSER';
  }) : [];

  return records.length;
}

/**
 * Get Total Advance Battle Looses
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getTotalAdvanceBattleLooses = function() {
  var wins = _.filter(this.battleWins, {battleType: 'ADVANCE'});
  
  var records = wins ? wins.filter(function(item) {
    return item.winningStatus == 'LOOSER';
  }) : [];
  
  return records.length;
}

/**
 * Get Total Battle Looses
 * 
 * @returns {Number}
 */
JackpotUser.prototype.getTotalBattleLooses = function() {
  return this.getTotalNormalBattleLooses() + this.getTotalAdvanceBattleLooses();
}

/**
 * Get Wins To Unlock This Level
 */
JackpotUser.prototype.getWinsToUnlockBattleLevel = function(currentLevel) {
  var previousLevel = currentLevel.getPreviousLevel(),
      requiredWins  = 0,
      alreadyWins   = 0,
      remainingWins = 0;

  if(previousLevel) {
    requiredWins  = previousLevel.minWinsToUnlockNext || 0;
    alreadyWins   = previousLevel.battleType == 'NORMAL' ? this.getTotalNormalBattleWins(previousLevel) : this.getTotalAdvanceBattleWins(previousLevel);
    remainingWins = Math.max(0, requiredWins - alreadyWins);
  }

  return remainingWins;
}


export default JackpotUser;
