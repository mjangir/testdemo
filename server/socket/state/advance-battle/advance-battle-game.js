'use strict'

import BattleGame from '../common/battle-game';

import {
  EVT_EMIT_JACKPOT_MY_INFO_CHANGED
} from '../../constants';

import {
	getUserObjectById
} from '../../../utils/functions';

function AdvanceBattleGame(level)
{
	BattleGame.call(this, level);

	this.roomPrefix = 'ADVANCE_BATTLE_SOCKET_ROOM';
}

AdvanceBattleGame.prototype = Object.create(BattleGame.prototype);

AdvanceBattleGame.prototype.constructor = AdvanceBattleGame;

AdvanceBattleGame.prototype.onUserAdded = function(user)
{
  // Deduct user's jackpot available bids required to join the game
  if(user.getJackpotAvailableBids() >= this.level.minBidsToGamb)
  {
      user.decreaseJackpotAvailableBids(this.level.minBidsToGamb);
      user.currentSocket.emit(EVT_EMIT_JACKPOT_MY_INFO_CHANGED, {
          name            : getUserObjectById(user.userId).name,
          availableBids   : user.getJackpotAvailableBids(),
          totalPlacedBids : user.getJackpotPlacedBids(),
      });
  }
}


export default AdvanceBattleGame;
