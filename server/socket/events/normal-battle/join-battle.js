'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattle from '../../utils/join-user-to-bid-battle';
import BattleLevel from '../../state/common/battle-level';

function handleJoinBattle(socket, data)
{
    var jackpot,
        user,
        battleLevel,
        battleGame,
        gotBattleGame;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
    {
        return;
    }

    jackpot 	= isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battleLevel = jackpot.getNormalBattleLevelById(data.levelUniqueId);

    if(!(battleLevel instanceof BattleLevel))
    {
    	return;
    }

    gotBattleGame = getUserBattleGame(battleLevel, user);

    if(gotBattleGame == false)
    {
        return;
    }

    gotBattleGame.then(function(data)
    {
        joinUserToBidBattle(data.level, data.user, data.game, socket, data);
    });
}

export default function(socket)
{
	return function(data)
	{
		handleJoinBattle(socket, data);
	}
}