'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattle from '../../utils/join-user-to-bid-battle-game';
import BattleLevel from '../../state/common/battle-level';
import BattleGame from '../../state/common/battle-game';

import { 
    EVT_EMIT_NO_ENOUGH_BIDS
} from '../../constants';

function handlePlacebid(socket, data)
{
    var jackpot,
        user,
        battleLevel,
        battleGame,
        bid;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
    {
        return;
    }

    jackpot 	= isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battleLevel = jackpot.getAdvanceBattleLevelById(data.levelUniqueId);

    if(battleLevel.constructor.name != 'AdvanceBattleLevel')
    {
    	return;
    }

    battleGame = battleLevel.getGameByUniqueId(data.gameUniqueId);

    if(!(battleGame instanceof BattleGame))
    {
    	return;
    }

    if(user.getAdvanceBattleAvailableBids(battleLevel, battleGame) <= 0)
    {
        user.emitNoEnoughAdvanceBattleBids(socket, battleLevel, battleGame);
        return;
    }

    if(battleGame.isStarted())
    {
        // Place the bid in corresponding user account
        bid = battleGame.placeBid(data.userId, socket);
    }
}

export default function(socket)
{
	return function(data)
	{
		handlePlacebid(socket, data);
	}
}
