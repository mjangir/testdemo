'use strict'

import BattleGame from '../common/battle-game';
import JackpotUser from '../jackpot/jackpot-user';
import { getUserObjectById } from '../../../utils/functions';

function AdvanceBattleGame(level)
{
	BattleGame.call(this, level);

	this.roomPrefix = 'ADVANCE_BATTLE_SOCKET_ROOM';
}

AdvanceBattleGame.prototype = Object.create(BattleGame.prototype);


export default AdvanceBattleGame;