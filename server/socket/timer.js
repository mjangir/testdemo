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

            // If jackpot is not started or finished, do nothing
            if(jackpot.gameStatus == 'NOT_STARTED' || jackpot.gameStatus == 'FINISHED')
            {
                continue;
            }

            // If game clock hits zero, finish the game. No further actions
            if(jackpot.gameClockRemaining == 0)
            {
                jackpot.finishGame();
                continue;
            }

            // Count down jackpot timer
            jackpot.countDownJackpotTimer();

            // Count down jackpot battles timer
            jackpot.countDownBattlesTimer();

            // Send current jackpot bidding info to all sockets
            jackpot.emitJackpotInfoEverySecond();

            // Send jackpot battle levels current bidding info
            jackpot.emitBattlesInfoEverySecond();

            // Update jackpot amount on each second as per config
            jackpot.emitJackpotAmountEverySecond();

            // If game clock is running & doomsday is over, show quit button
            jackpot.emitShowQuitButton();

            // Temporary
            jackpot.showConsoleInfoEverySecond();
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