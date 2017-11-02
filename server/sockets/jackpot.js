'use strict';

import logger from '../utils/logger';
import jackpotState from './state/jackpot';
import moment from 'moment';
import sqldb from '../sqldb';

import {
    onPlaceBid,
    onConnect,
    jackpotTimer
} from './events/jackpot';

import {
    EVT_ON_CLIENT_CONNECTION
} from './events/jackpot/constants';

const SettingsModel = sqldb.Settings;

/**
 * Configure Jackpot SocketIO
 *
 * @param  {Socket.IO} socketio
 * @return {*}
 */
export default function(socketio)
{
    SettingsModel.findAllSettingsAsJson(function(error, settings)
    {
        global.globalSettings = settings;

        // Store all jackpots in memory
        global.globalJackpotSocketState = new jackpotState((function(socketio)
        {
            var IO = socketio;

            global.globalJackpotSocketIO = IO;

            return function()
            {
                // Create Namespace
                var namespace = socketio.of('jackpot');

                // Register as global namespace
                global.jackpotSocketNamespace = namespace;

                // On connection
                namespace.on(EVT_ON_CLIENT_CONNECTION, onConnect);

                // Start cound down of all jackpot's game clock and doomsday clock
                jackpotTimer();
            }

        }(socketio)));
    });
}