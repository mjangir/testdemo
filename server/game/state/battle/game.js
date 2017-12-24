import Game from '../common/game';
import _ from 'lodash';

/**
 * Battle Game
 * 
 * @param {any} parent 
 */
function BattleGame(parent) {
  Game.call(this);
  this.parent = parent;
  this.setTimeclocks();
}

BattleGame.prototype = Object.create(Game.prototype);

/**
 * Set Time Clocks
 * 
 * @returns {*}
 */
BattleGame.prototype.setTimeclocks = function() {
  this.setClock('game', this.parent.gameDuration);
}

/**
 * Is Game Clock Over
 * 
 * @returns {Boolean}
 */
BattleGame.prototype.isGameClockOver = function()
{
  return this.getClock('game').remaining == 0;
}

/**
 * Get Battle Game Header Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getGameHeaderInfo = function() {
  return {
    name      : this.parent.title,
    prize     : this.parent.getPrizeValue(),
    gameClock : this.getClock('game').getFormattedRemaining()
  };
}

export default BattleGame;
