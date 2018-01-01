
import JackpotGame from './game';
import BattleLevel from '../battle/level';
import sqldb from '../../../sqldb';
import _ from 'lodash';

const UserModel                 = sqldb.User;
const JackpotModel              = sqldb.Jackpot;
const JackpotGameModel          = sqldb.JackpotGame;
const JackpotGameUserModel      = sqldb.JackpotGameUser;
const JackpotGameUserBidModel   = sqldb.JackpotGameUserBid;
const JackpotGameWinnerModel    = sqldb.JackpotGameWinner;
const UserWinningMoneyStatement = sqldb.UserWinningMoneyStatement;

/**
 * Jackpot Constructor
 * 
 */
function Jackpot(data) {
  this.id                       = data.id,
  this.uniqueId                 = data.uniqueId,
  this.title                    = data.title;
  this.amount                   = data.amount;
  this.minPlayersRequired       = data.minPlayersRequired;
  this.gameDuration             = data.gameClockTime;
  this.doomsdayDuration         = data.doomsDayTime;
  this.increaseSecondsOnBid     = data.increaseSecondsOnBid;
  this.defaultAvailableBids     = data.defaultAvailableBids;
  this.secondsToIncreaseAmount  = data.increaseAmountSeconds;
  this.increaseAmount           = data.increaseAmount;
  this.users                    = [];
  this.battleLevels             = [];
  this.game                     = new JackpotGame(this);

  this.addBattleLevels(data);
}

/**
 * Add Jackpot Battle Levels
 * 
 * @param {*} data 
 */
Jackpot.prototype.addBattleLevels = function(data) {
  if(data.hasOwnProperty('JackpotBattleLevels') && Array.isArray(data.JackpotBattleLevels))
  {
      var levels = data.JackpotBattleLevels;
      for(var k in levels)
      {
          this.battleLevels.push(new BattleLevel(this, levels[k]));
      }
  }
}

/**
 * Run Every Second
 */
Jackpot.prototype.runEverySecond = function() {
  
  this.game.runEverySecond();

  for(var k in this.battleLevels) {
    this.battleLevels[k].runEverySecond();
  }
}

/**
 * Update Status In Database
 * 
 * @param {String} status 
 * @returns {*}
 */
Jackpot.prototype.updateStatusInDB = function(status) {
  return JackpotModel.find({where: { id: this.id } })
  .then(function(jackpot)
  {
      return jackpot.updateAttributes({gameStatus: status});
  });
}

/**
 * Get Normal Battle Levels
 * 
 * @returns {Array}
 */
Jackpot.prototype.getNormalBattleLevels = function() {
  return _.filter(this.battleLevels, {battleType: 'NORMAL'});
}

/**
 * Get Advance Battle Levels
 * 
 * @returns {Array}
 */
Jackpot.prototype.getAdvanceBattleLevels = function() {
  return _.filter(this.battleLevels, {battleType: 'GAMBLING'});
}

/**
 * Get Normal Battle Level By Order
 * 
 * @param {Number} order
 * @returns {BattleLevel}
 */
Jackpot.prototype.getNormalBattleLevelByOrder = function(order) {
  return _.find(this.getNormalBattleLevels(), {order: order});
}

/**
 * Get Advance Battle Level By Order
 * 
 * @param {Number} order
 * @returns {BattleLevel}
 */
Jackpot.prototype.getAdvanceBattleLevelByOrder = function(order) {
  return _.find(this.getAdvanceBattleLevels(), {order: order});
}

/**
 * Get Battle Level By ID
 * 
 * @param {String} uniqueId 
 */
Jackpot.prototype.getBattleLevelById = function(uniqueId) {
  return _.find(this.battleLevels, {uniqueId: uniqueId});
}

export default Jackpot;
