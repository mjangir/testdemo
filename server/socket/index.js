'use strict';

import logger from '../utils/logger';
import createGlobalGameState from './game-state';
import startTimer from './timer';
import { EVT_ON_CLIENT_CONNECTION } from './constants';
import onConnect from './events/connect';

/**
 * Bind All Socket Event Handlers
 *
 * @param  {Object} socketio
 * @return {*}
 */
function bindJackpotSocketEventHandlers(socketio)
{
    // Create Namespace
    var namespace = socketio.of('jackpot');

    // Register as global namespace
    global.ticktockGameState.jackpotSocketNamespace = namespace;

    // On connection
    namespace.on(EVT_ON_CLIENT_CONNECTION, onConnect);
}

/**
 * Configure socketio for both Jackpot and Money Battle
 *
 * @param  {Object} socketio
 * @return {*}
 */
export default function(socketio)
{
    global.ticktockGameState = {
        settings            : [],
        users               : [],
        jackpots            : [],
        moneyBattleLevels   : [],
        jackpotSocketNs     : null,
        moneyBattleSocketNs : null,
        socketIO            : socketio
    }

    // Create Global Game State
    createGlobalGameState(socketio).then(function(jackpots)
    {
        // Bind jackpot socket event handlers
        bindJackpotSocketEventHandlers(socketio);

        // When everything is setup, start the game timer
        startTimer();

    }).catch(function(err)
    {
        logger.error(err);
    });
}