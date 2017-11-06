'use strict';

import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import TimeclockContainer from '../common/timeclock-container';
import JackpotUser from './jackpot-user';
import BidContainer from '../common/bid-container';
import Game from '../common/game';
import sqldb from '../../../sqldb';
import _ from 'lodash';
import { getUserObjectById, convertAmountToCommaString } from '../../../utils/functions';
import {
    EVT_EMIT_JACKPOT_UPDATE_AMOUNT,
    EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON,
    EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM,
    EVT_EMIT_JACKPOT_UPDATE_TIMER,
    EVT_EMIT_JACKPOT_CAN_I_BID
} from '../../constants';

const JackpotModel = sqldb.Jackpot;

function Jackpot(data)
{
    Game.call(this, data);

    this.id                         = data.id,
    this.title                      = data.title;
    this.jackpotAmount              = data.amount;
    this.minPlayersRequired         = data.minPlayersRequired;
    this.gameClockDuration          = data.gameClockTime;
    this.doomsdayClockDuration      = data.doomsDayTime;
    this.gameClockRemaining         = data.gameClockTime;
    this.doomsdayClockRemaining     = data.doomsDayTime;
    this.secondsToIncreaseAmount    = data.increaseAmountSeconds;
    this.increaseAmount             = data.increaseAmount;
    this.gameStatus                 = data.gameStatus;
    this.uniqueId                   = data.uniqueId;
    this.isActive                   = data.status == 'ACTIVE' ? true : false;
    this.startedOn                  = null;
    this.roomPrefix                 = 'JACKPOT_SOCKET_ROOM';

    this.users                      = [];
    this.normalBattleLevels         = [];
    this.advanceBattleLevels        = [];

    // Add Battle Levels
    this.addBattleLevels(data);
    this.setTimeclocks(data);
}

Jackpot.prototype = Object.create(Game.prototype);

Jackpot.prototype.isDoomsDayOver = function()
{
    return this.getClock('doomsday').remaining == 0;
}

Jackpot.prototype.placeBid = function(userId, socket)
{
    return this.bidContainer.placeBid(userId, socket, this.afterUserPlacedBid.bind(this));
}

Jackpot.prototype.afterUserPlacedBid = function(bidContainer, parent, socket, bid)
{
    var user = this.getUserById(bid.userId);

    if(user)
    {
        user.afterPlacedBid(bidContainer, parent, socket, bid);
        parent.increaseClockOnNewBid();
        socket.broadcast.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_CAN_I_BID, {canIBid: true});
    }
}

Jackpot.prototype.increaseClockOnNewBid = function()
{
    var key         = 'jackpot_setting_game_clock_seconds_increment_on_bid',
        settings    = global.ticktockGameState.settings,
        seconds     = settings.hasOwnProperty(key) && settings[key] != "" ? parseInt(settings[key], 10) : 10;

    this.getClock('game').increaseBy(seconds);
}

Jackpot.prototype.startGame = function()
{
    this.gameStatus = 'STARTED';
    this.startedOn  = new Date();
    this.updateStatusInDB('STARTED');
}

Jackpot.prototype.updateStatusInDB = function(status)
{
    return JackpotModel.find({where: { id: this.id } })
    .then(function(jackpot)
    {
        return jackpot.updateAttributes({gameStatus: status});
    });
}

Jackpot.prototype.setTimeclocks = function(data)
{
    // Set the clocks
    this.timeclockContainer.setClocks([
    {
        clockName   : 'game',
        duration    : data.gameClockTime
    },
    {
        clockName   : 'doomsday',
        duration    : data.doomsDayTime
    }]);

    // Set update jackpot amoutn callback
    if(this.secondsToIncreaseAmount && this.increaseAmount)
    {
        this.getClock('game').runEveryXSecond(this.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
    }
}

Jackpot.prototype.updateJackpotAmount = function(elapsed)
{
    this.jackpotAmount = Number(parseFloat(this.jackpotAmount, 10) + parseFloat(this.increaseAmount, 10)).toFixed(2);
    this.sendUpdatedAmountToJackpotSockets();
    this.sendUpdatedAmountToBattleSockets();
}

Jackpot.prototype.sendUpdatedAmountToJackpotSockets = function()
{
    var amount = convertAmountToCommaString(this.jackpotAmount);

    global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_UPDATE_AMOUNT, {amount: amount});
}

Jackpot.prototype.sendUpdatedAmountToBattleSockets = function()
{

}

Jackpot.prototype.getUsers = function()
{
    return this.users;
}

Jackpot.prototype.getActiveUsers = function()
{
    return _.filter(this.users, function(o)
    {
        return o.isActive == true;
    });
}

Jackpot.prototype.getInActiveUsers = function()
{
    return _.filter(this.users, function(o)
    {
        return o.isActive == false;
    });
}

Jackpot.prototype.getAverageBidBank = function()
{
    var totalAvailableBids = 0;

    for(var k in this.users)
    {
        totalAvailableBids += this.users[k].availableBids['jackpot'];
    }

    return Math.round(totalAvailableBids/this.users.length);
}

Jackpot.prototype.addUserById = function(userId)
{
    var user = new JackpotUser(this, userId);
    this.users.push(user);
    user.setDefaultJackpotAvailableBids();
    return user;
}

Jackpot.prototype.getUserById = function(userId)
{
    if(this.users.length == 0)
    {
        return false;
    }

    for(var k in this.users)
    {
        if(this.users[k].userId == userId)
        {
            return this.users[k];
        }
    }

    return false;
}

Jackpot.prototype.addBattleLevels = function(data)
{
    var levels,
        level;

    if(data.hasOwnProperty('JackpotBattleLevels') && Array.isArray(data.JackpotBattleLevels))
    {
        levels = data.JackpotBattleLevels;

        for(var k in levels)
        {
            if(levels[k].battleType == 'NORMAL')
            {
                this.normalBattleLevels.push(new NormalBattleLevel(this, levels[k]));
            }
            else if(levels[k].battleType == 'GAMBLING')
            {
                this.advanceBattleLevels.push(new AdvanceBattleLevel(this, levels[k]));
            }
        }
    }
}

Jackpot.prototype.getNormalBattleLevelById = function(uniqueId)
{
    return _.find(this.normalBattleLevels, {uniqueId: uniqueId});
}

Jackpot.prototype.getAdvanceBattleLevelById = function(uniqueId)
{
    return _.find(this.advanceBattleLevels, {uniqueId: uniqueId});
}

Jackpot.prototype.getNormalBattleLevels = function()
{
    return _.sortBy(this.normalBattleLevels, 'order');
}

Jackpot.prototype.getAdvanceBattleLevels = function()
{
    return _.sortBy(this.advanceBattleLevels, 'order');
}

Jackpot.prototype.saveDataInDB = function()
{

}

Jackpot.prototype.emitBattlesInfoEverySecond = function()
{
    if(this.normalBattleLevels.length > 0)
    {
        for(var i in this.normalBattleLevels)
        {
            this.normalBattleLevels[i].updateTimerEverySecond();
        }
    }

    if(this.advanceBattleLevels.length > 0)
    {
        for(var k in this.advanceBattleLevels)
        {
            this.advanceBattleLevels[k].updateTimerEverySecond();
        }
    }
}

Jackpot.prototype.emitSomeoneJoined = function()
{
    this.emitUpdatesToItsRoom();
}

Jackpot.prototype.emitSomeoneQutted = function()
{
    this.emitUpdatesToItsRoom();
}

/**
 * Methods That Will Be Called Every Second
 * for JACKPOT
 */

Jackpot.prototype.fireForJackpotOnEverySecond = function()
{
    if(this.isNotStarted() || this.isFinished())
    {
        this.emitTimerUpdates();
        return;
    }

    this.countDown();
    this.emitShowQuitButton();
    this.finishGame();
    this.emitTimerUpdates();
    this.emitUpdatesToItsRoom();
}

Jackpot.prototype.emitShowQuitButton = function()
{
    var gcRemaining = this.getClockRemaining('game'),
        ddRemaining = this.getClockRemaining('doomsday');

    if(gcRemaining > 0 && ddRemaining <= 0)
    {
        global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON, {
            status: true
        });
    }
}

Jackpot.prototype.finishGame = function()
{
    var context = this;

    if(context.getClockRemaining('game') == 0)
    {
        this.gameStatus = 'FINISHED';

        setTimeout(function()
        {
            context.saveDataInDB();
        });
    }
}

Jackpot.prototype.emitTimerUpdates = function()
{
    var roomName = this.getRoomName();

    global.ticktockGameState.jackpotSocketNs.in(roomName).emit(EVT_EMIT_JACKPOT_UPDATE_TIMER, {
        gameClockTime       : this.getClock('game').getFormattedRemaining(),
        doomsDayClockTime   : this.getClock('doomsday').getFormattedRemaining(),
        lastBidDuration     : this.bidContainer.getLastBidDuration(true),
        lastBidUserName     : this.bidContainer.getLastBidUserName(),
        longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
        longestBidUserName  : this.bidContainer.getLongestBidUserName()
    });
}

Jackpot.prototype.emitUpdatesToItsRoom = function()
{
    var room = this.getRoomName(),
        data = this.getUpdatedJackpotData();

    global.ticktockGameState.jackpotSocketNs.in(room).emit(EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM, data);
}

Jackpot.prototype.getUpdatedJackpotData = function()
{
    var bidContainer    = this.bidContainer,
        placedBids      = bidContainer.getAllBids();

    return {
        totalUsers      : this.getUsers().length,
        activePlayers   : this.getActiveUsers().length,
        remainingPlayers: this.getInActiveUsers().length,
        longestBid      : null,
        averageBidBank  : this.getAverageBidBank(),
        totalBids       : placedBids.length,
        currentBidUser  : {name: bidContainer.getLastBidUserName()}
    };
}

/**
 * Methods That Will Be Called Every Second For Battles
 */
Jackpot.prototype.fireForBattleOnEverySecond = function()
{
    if(this.normalBattleLevels.length > 0)
    {
        for(var i in this.normalBattleLevels)
        {
            this.normalBattleLevels[i].fireOnEverySecond();
        }
    }

    if(this.advanceBattleLevels.length > 0)
    {
        for(var k in this.advanceBattleLevels)
        {
            this.advanceBattleLevels[k].fireOnEverySecond();
        }
    }
}

export default Jackpot;