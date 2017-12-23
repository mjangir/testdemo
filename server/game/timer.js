'use strict';

import logger from '../utils/logger';
import moment from 'moment';
import sqldb from '../sqldb';

/**
 * Process Jackpots
 *
 * @return {*}
 */
function processJackpots()
{
    var jackpots = global.ticktockGameState.jackpots,
        jackpot;

    if(jackpots.length > 0)
    {
        for(var k in jackpots)
        {
            jackpot = jackpots[k];
            jackpot.runEverySecond();
        }
    }
}

export default function()
{
    setInterval(function()
    {
        processJackpots();

    }, 1000);
}
