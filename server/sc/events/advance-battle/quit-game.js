'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattle from '../../utils/join-user-to-bid-battle-game';
import BattleLevel from '../../state/common/battle-level';
import BattleGame from '../../state/common/battle-game';
import {
    EVT_EMIT_SOMETHING_WENT_WRONG
} from '../../constants';

/**
 * Handle Quit Game
 *
 * @param  {Socket} socket
 * @param  {Object} data
 * @return {*}
 */
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

    // Get jackpot, user and level through socket data
    jackpot     = isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battleLevel = jackpot.getNormalBattleLevelById(data.levelUniqueId);

    // If level is not valid BattleLevel
    if(!(battleLevel instanceof BattleLevel))
    {
        socket.emit(EVT_EMIT_SOMETHING_WENT_WRONG);
        return;
    }

    // Get the existing game of the user
    battleGame = battleLevel.getGameByUniqueId(data.gameUniqueId);

    // Game is not valid BattleGame
    if(!(battleGame instanceof BattleGame))
    {
        socket.emit(EVT_EMIT_SOMETHING_WENT_WRONG);
        return;
    }

    // Quit The Game
    user.quitAdvanceBattleGame(socket, battleLevel, battleGame);
}

export default function(socket)
{
	return function(data)
	{
		handleQuitGame(socket, data);
	}
}