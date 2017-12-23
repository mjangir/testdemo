
import JackpotGame from './jackpot-game';
import BattleLevel from '../battle/level';

/**
 * Jackpot Constructor
 * 
 */
function Jackpot(data) {
  this.id                       = data.id,
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
  this.game                     = new JackpotGame();

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
      levels = data.JackpotBattleLevels;
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
