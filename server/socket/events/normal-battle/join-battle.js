'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBidBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattleGame from '../../utils/join-user-to-bid-battle-game';
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

    gotBattleGame = getUserBidBattleGame(battleLevel, user);

    if(gotBattleGame == false)
    {
        return;
    }

    gotBattleGame.then(function(data)
    {
        joinUserToBidBattleGame(data.level, data.user, data.game, socket, data);
    });
}

export default function(socket)
{
	return function(data)
	{
		handleJoinBattle(socket, data);
	}
}