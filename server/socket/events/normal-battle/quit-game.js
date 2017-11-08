'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattle from '../../utils/join-user-to-bid-battle';
import BattleLevel from '../../state/common/battle-level';
import BattleGame from '../../state/common/battle-game';

function handleQuitGame(socket, data)
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

    jackpot     = isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battleLevel = jackpot.getNormalBattleLevelById(data.levelUniqueId);

    if(!(battleLevel instanceof BattleLevel))
    {
        return;
    }

    battleGame = battleLevel.getGameByUniqueId(data.gameUniqueId);

    if(!(battleGame instanceof BattleGame))
    {
        return;
    }

    // Quit Game
    user.quitNormalBattleGame(socket, battleLevel, battleGame);
}

export default function(socket)
{
	return function(data)
	{
		handleQuitGame(socket, data);
	}
}