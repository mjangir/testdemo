'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBidBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattleGame from '../../utils/join-user-to-bid-battle-game';
import BattleLevel from '../../state/common/battle-level';
import {
    EVT_EMIT_NORMAL_BATTLE_NOT_ELIGIBLE_TO_JOIN,
    EVT_EMIT_SOMETHING_WENT_WRONG
} from '../../constants';

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

    // Get jackpot, user and battle level through socket data
    jackpot     = isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battleLevel = jackpot.getNormalBattleLevelById(data.levelUniqueId);

    // If level is not a valid BattleLevel
    if(battleLevel.constructor.name != 'NormalBattleLevel')
    {
        socket.emit(EVT_EMIT_SOMETHING_WENT_WRONG);
        return;
    }

    // If user is not able to join the level
    if(!battleLevel.isUserAbleToJoin(user))
    {
        socket.emit(EVT_EMIT_NORMAL_BATTLE_NOT_ELIGIBLE_TO_JOIN);
        return;
    }

    // Get battle game for the user
    gotBattleGame = getUserBidBattleGame(battleLevel, user);

    // If could not find any game
    if(gotBattleGame == false)
    {
        socket.emit(EVT_EMIT_SOMETHING_WENT_WRONG);
        return;
    }

    // If battle game found, then join the user to it
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