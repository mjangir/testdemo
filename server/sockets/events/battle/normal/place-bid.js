'use strict';

import {
    EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID,
    EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON,
    EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON,
    EVT_EMIT_NO_ENOUGH_AVAILABLE_BIDS
} from '../constants';


function handlePlaceBid(data, socket)
{
    var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
        jackpotUserInstance     = jackpotInstance.getUser(data.userId),
        normalBattleContainer   = jackpotInstance.normalBattleContainer,
        currentBattleLevel      = normalBattleContainer.getLevelByUniqueId(data.levelUniqueId),
        currentBattleGame       = currentBattleLevel ? currentBattleLevel.getGameByUniqueId(data.gameUniqueId) : false,
        currentGameUser;

    if(currentBattleGame)
    {
        currentGameUser = currentBattleGame.getUser(jackpotUserInstance);

        if(currentGameUser.availableBids <= 0)
        {
            socket.emit(EVT_EMIT_NO_ENOUGH_AVAILABLE_BIDS);
            return;
        }

        currentBattleGame.placeBid(currentGameUser, function(bid, gameUser)
        {
            // Update the socket itself
            socket.emit(EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID, {
                totalPlacedBids: currentGameUser.getAllBids().length,
                availableBids: currentGameUser.availableBids
            });

            // Emit Hide Place bid button
            socket.emit(EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON);

            // Broadcast show Place bid button
            socket.broadcast.in(currentBattleGame.getRoomName()).emit(EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON);

            // Update the new detail to all room members
            currentBattleGame.emitUpdatesToItsRoom();
        });
    }
}

export default function(socket)
{
    return function(data)
    {
        handlePlaceBid(data, socket);
    };
}