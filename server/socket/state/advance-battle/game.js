'use strict'

import CommonGame from '../common/game';

function Game(level)
{
    CommonGame.call(this, level);
}

Game.prototype = Object.create(CommonGame.prototype);

export default Game;