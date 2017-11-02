'use strict';

import handleNormalBattleRequest from './request-normal-battle';
import handleGamblingBattleRequest from './request-gambling-battle';

function getAppropriateBattleType()
{
    return 'NORMAL';
}

/**
 * Handle on request battle
 *
 * @param  {Object} data
 * @param  {Socket} socket
 * @return {*}
 */
function handleRequestBattle(data, socket)
{
    var jackpotInstance,
        jackpotUserInstance,
        normalBattleContainer,
        gamblingBattleContainer,
        responseBattleType;

    // If jackpot or user ID is not valid, throw error
    if(!data.jackpotUniqueId || !data.userId || !global.globalJackpotSocketState.hasJackpot(data.jackpotUniqueId))
    {
        socket.emit('request_battle_error', {
            error: "Invalid User or Jackpot ID"
        });
    }
    else
    {
        // Get corresponding jackpot and user instances
        jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId);
        jackpotUserInstance     = jackpotInstance.getUser(data.userId);
        normalBattleContainer   = jackpotInstance.normalBattleContainer;
        gamblingBattleContainer = jackpotInstance.gamblingBattleContainer;

        responseBattleType      = getAppropriateBattleType();

        if(responseBattleType == 'NORMAL')
        {
            handleNormalBattleRequest(data, socket);
        }
        else if(responseBattleType == 'GAMBLING')
        {
            handleGamblingBattleRequest(data, socket);
        }
    }
}

/**
 * Handle Request Battle
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    return function(data)
    {
        handleRequestBattle(data, socket);
    };
}

