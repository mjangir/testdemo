'use strict'

import BattleLevelGame from '../common/battle-level-game';

function Game(level)
{
    BattleLevelGame.call(this, level);
}

Game.prototype = Object.create(BattleLevelGame.prototype);

export default Game;