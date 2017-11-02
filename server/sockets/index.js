'use strict';

import jackpot from './jackpot';
import battle from './battle';

/**
 * Configure socketio for both Jackpot and Battle
 *
 * @param  {Object} socketio
 * @return {*}
 */
export default function(socketio)
{
	global.globalSettings 			= null;
    global.globalJackpotSocketState = null;
    global.globalBattleSocketState  = null;
    global.jackpotSocketNamespace   = null;
    global.battleSocketNamespace    = null;
    global.globalJackpotSocketIO 	= null;

    // Configure jackpot socket.io
    jackpot(socketio);

    // Configure battle socket.io
    battle(socketio);
}