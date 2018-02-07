import BattleGame from "./game";
import { generateRandomString } from '../../../utils/functions';
import _ from 'lodash';


/**
 * Battle Level
 * 
 */
function BattleLevel(jackpot, data) {
  this.jackpot                  = jackpot;
  this.id 						          = data.id;
  this.uniqueId                 = generateRandomString(20, 'aA');
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
 * Get Wins To Unlock Next Level
 * 
 * @param  {JackpotUser} user
 * @return {Number}
 */
BattleLevel.prototype.getWinsToUnlockNextLevel = function(user)
{
  var totalWins         = 0,
      totalRequired     = 0,
      remainingRequired = 0;

  if(this.battleType == 'NORMAL') {
    totalWins         = user.getTotalNormalBattleWins(this);
    totalRequired     = parseInt(this.minWinsToUnlockNext, 10);
    remainingRequired = totalRequired - totalWins;
  }

  return remainingRequired <= 0 ? 0 : remainingRequired;
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
	var minWinsToUnlockNext = parseInt(previousLevel.minWinsToUnlockNext, 10),
    totalWinnings 		    = parseInt(user.getTotalNormalBattleWins(previousLevel), 10);

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
  } else if(this.battleType == 'ADVANCE') {
    return this.minPlayersRequired * this.minBidsToGamb;
  }
}

/**
 * Get Active Players Count
 * 
 * @returns {Number}
 */
BattleLevel.prototype.getPlayersCount = function() {
  var jackpot = this.jackpot,
      game    = jackpot.game,
      users   = game.getAllUsers(),
      count   = 0;

  if(users.length > 0) {
    for(var k in users) {
      if(users[k].gameStatus != 'QUITTED' && (this.battleType == 'ADVANCE' || (this.order == 1 || !this.isLockedForUser(this, users[k])))) {
        count += 1;
      }
    }
  }

  return count;
}

/**
 * Get Active Players Count
 * 
 * @returns {Number}
 */
BattleLevel.prototype.getActivePlayersCount = function() {
  var battleGames = this.getAllGames(),
      count       = 0;

  if(battleGames.length > 0) {
    for(var k in battleGames) {
      count += battleGames[k].getAllUsers().length;
    }
  }

  return count;
}

/**
 * Get All Games
 * 
 * @returns {Array}
 */
BattleLevel.prototype.getAllGames = function() {
  return this.games;
}

/**
 * Get Game By Unique ID
 * 
 * @param {String} uniqueId 
 * @returns {BattleGame}
 */
BattleLevel.prototype.getGameByUniqueId = function(uniqueId) {
  return _.find(this.games, {uniqueId: uniqueId});
}

/**
 * Create New Game
 * 
 * @returns {Battle Game}
 */
BattleLevel.prototype.createNewGame = function() {
  var game = new BattleGame(this);
	this.games.push(game);
	return game;
}

/**
 * Get Available Game Slot
 *
 * @return {BattleGame}
 */
BattleLevel.prototype.getAvailableGameSlot = function() {
	var games = this.games,
		  users,
		  minPlayers;

	if(games.length > 0) {
		for(var k in games) {
			users 		  = games[k].getAllUsers(),
			minPlayers 	= this.minPlayersRequired;

			if(users.length < minPlayers) {
				return games[k];
			}
		}
	}

	return false;
}

/**
 * Is User Able To Join
 * 
 * @param {JackpotUser} user 
 * @returns {Boolean}
 */
BattleLevel.prototype.isUserAbleToJoin = function(user) {
  if(this.battleType == 'NORMAL') {
    return this.isUserAbleToJoinNormalBattle(user);
  } else if(this.battleType == 'ADVANCE') {
    return this.isUserAbleToJoinAdvanceBattle(user);
  }
}

/**
 * Is User Able To Join Normal Battle Level
 * 
 * @param {JackpotUser} user 
 * @returns {Boolean}
 */
BattleLevel.prototype.isUserAbleToJoinNormalBattle = function(user) {
  var jackpot 	= this.jackpot,
      order 		= this.order,
      prevOrder = Math.max(1, order - 1);

	if(prevOrder == 1) {
		return true;
	} else {
		var previousLevel 	= jackpot.getNormalBattleLevelByOrder(prevOrder),
        isLockedForUser = this.isLockedForUser(previousLevel, user);

		return !isLockedForUser;
	}
}

/**
 * Is User Able To Join Advance Battle Level
 * 
 * @param {JackpotUser} user 
 * @returns {Boolean}
 */
BattleLevel.prototype.isUserAbleToJoinAdvanceBattle = function(user) {
  var userJackpotAvailableBids 	= user.getJackpotAvailableBids(),
		  requiredAvailableBids 		= this.minBidsToGamb;

	return userJackpotAvailableBids >= requiredAvailableBids;
}

/**
 * Get Last Bid Winner Prize
 * 
 * @returns {Number}
 */
BattleLevel.prototype.getLastBidWinnerPrize = function()
{
  var prizeValue 	= this.getPrizeValue(),
      percent 	  = parseFloat(this.lastBidWinnerPercent, 10),
      percent 	  = !isNaN(percent) ? percent : 100;

	return parseInt((percent/100 * prizeValue), 10);
}

/**
 * Get Longest Bid Winner Prize
 * 
 * @returns {Number}
 */
BattleLevel.prototype.getLongestBidWinnerPrize = function()
{
  var prizeValue 	= this.getPrizeValue(),
      percent 	  = parseFloat(this.longestBidWinnerPercent, 10),
      percent 	  = !isNaN(percent) ? percent : 100;

	return parseInt((percent/100 * prizeValue), 10);
}

/**
 * Get Single Winner Prize
 * 
 * @returns {Number}
 */
BattleLevel.prototype.getSingleWinnerPrize = function()
{
  return this.getPrizeValue();
}

/**
 * Get Previous Battle Level
 */
BattleLevel.prototype.getPreviousLevel = function()
{
  var order = parseInt(this.order, 10),
      type  = this.battleType,
      prev;

  if(type == 'NORMAL') {
    prev = this.jackpot.getNormalBattleLevelByOrder(Math.max(0, order - 1));
  } else if(type == 'ADVANCE') {
    prev = this.jackpot.getAdvanceBattleLevelByOrder(Math.max(0, order - 1));
  }

  return prev;
}

export default BattleLevel;
