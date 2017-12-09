'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import { EVT_EMIT_JACKPOT_RESPONSE_BATTLE } from '../../constants';
import JackpotUser from '../../state/jackpot/jackpot-user';

function handleRequestBattle(socket, data)
{
    var levels = [],
        jackpot,
        user,
        bid,
        battles,
        battleType;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
    {
        return;
    }

    jackpot     = isJackpotExist(data.jackpotUniqueId);
    user        = jackpot.getUserById(data.userId);
    battles     = jackpot.isDoomsDayOver() ? jackpot.getAdvanceBattleLevels() : jackpot.getNormalBattleLevels();
    battleType  = jackpot.isDoomsDayOver() ? 'ADVANCE' : 'NORMAL';

    if(battles.length > 0 || user instanceof JackpotUser)
    {
        for(var k in battles)
        {
            levels.push({
                uniqueId                : battles[k].uniqueId,
                order                   : battles[k].order,
                levelName               : battles[k].levelName,
                prizeValue              : battles[k].getPrizeValue(),
                defaultAvailableBids    : battles[k].defaultAvailableBids,
                isLastLevel             : battles[k].isLastLevel,
                minRequiredBids         : battles[k].minBidsToGamb ? battles[k].minBidsToGamb : 0,
                prizeType               : 'BID',
                isLocked                : k == 0 ? false : battles[k].isLockedForUser(battles[k-1], user),
            });
        }
    }

    socket.emit(EVT_EMIT_JACKPOT_RESPONSE_BATTLE, {
        currentGameInfo     : false,
        battleType          : battleType,
        battleLevelsList    : levels
    });
}

export default function(socket)
{
    return function(data)
    {
        handleRequestBattle(socket, data);
    }
}
