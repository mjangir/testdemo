'use strict'

import BattleLevelGame from '../common/battle-level-game';

function Game(data)
{
    BattleLevelGame.call(this);
}

Game.prototype = Object.create(BattleLevelGame.prototype);

export default Game;