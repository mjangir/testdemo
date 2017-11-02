'use strict';

import {
    EVT_EMIT_GAME_FINISHED
} from './constants';

/**
 * Finish Game Callback
 *
 * @param  {Jackpot} jackpot
 * @param  {Object} fullData
 * @return {*}
 */
export default function(jackpot, fullData)
{
    var roomName = jackpot.getRoomName();

    // Save jackpot data into database
    jackpot.saveDataIntoDB(fullData, function(err)
    {

    });

    // Notify all users that game has been finished
    global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_GAME_FINISHED, fullData.winnerData);
}