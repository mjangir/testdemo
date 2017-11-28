'use strict'

import BattleGame from '../common/battle-game';

function AdvanceBattleGame(level)
{
	BattleGame.call(this, level);

	this.roomPrefix = 'ADVANCE_BATTLE_SOCKET_ROOM';
}

AdvanceBattleGame.prototype = Object.create(BattleGame.prototype);

AdvanceBattleGame.prototype.constructor = AdvanceBattleGame;


export default AdvanceBattleGame;