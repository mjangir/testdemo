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

            // Fire On Every Second For Jackpot
            jackpot.fireForJackpotOnEverySecond();

            // Fire On Every Second For Battles
            jackpot.fireForBattleOnEverySecond();
        }
    }
}

function processMoneyBattles()
{

}

export default function()
{
    setInterval(function()
    {
        processJackpots();

        processMoneyBattles();

    }, 1000);
}