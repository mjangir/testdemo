'use strict'

import BattleGame from '../common/battle-game';

function NormalBattleGame(level)
{
	BattleGame.call(this, level);

	this.roomPrefix = 'NORMAL_BATTLE_SOCKET_ROOM';
}

NormalBattleGame.prototype = Object.create(BattleGame.prototype);

NormalBattleGame.prototype.constructor = NormalBattleGame;

NormalBattleGame.prototype.onUserAdded = function()
{
  
}

export default NormalBattleGame;
