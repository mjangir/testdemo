'use strict';

import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import TimeclockContainer from '../common/timeclock-container';
import JackpotUser from './jackpot-user';
import BidContainer from '../common/bid-container';
import sqldb from '../../../sqldb';
import _ from 'lodash';
import { getUserObjectById, convertAmountToCommaString } from '../../../utils/functions';
import {
	EVT_EMIT_JACKPOT_UPDATE_AMOUNT,
	EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON,
	EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM,
	EVT_EMIT_JACKPOT_UPDATE_TIMER
} from '../../constants';

const JackpotModel = sqldb.Jackpot;

function Jackpot(data)
{
	this.id 						= data.id,
	this.title 						= data.title;
	this.JackpotAmount 				= data.amount;
	this.minPlayersRequired 		= data.minPlayersRequired;
	this.gameClockDuration 			= data.gameClockTime;
	this.doomsdayClockDuration 		= data.doomsDayTime;
	this.gameClockRemaining 		= data.gameClockTime;
	this.doomsdayClockRemaining 	= data.doomsDayTime;
	this.secondsToIncreaseAmount 	= data.increaseAmountSeconds;
	this.increaseAmount 			= data.increaseAmount;
	this.gameStatus 				= data.gameStatus;
	this.uniqueId 					= data.uniqueId;
	this.isActive 					= data.status == 'ACTIVE' ? true : false;
	this.startedOn 					= null;

	this.users 						= [];
	this.normalBattleLevels 		= [];
	this.advanceBattleLevels 		= [];
	this.bidContainer 				= new BidContainer(this);
	this.timeclockContainer 		= new TimeclockContainer(this);

	// Add Battle Levels
	this.addBattleLevels(data);
	this.setTimeclocks(data);
}

Jackpot.prototype.isStarted = function()
{
	return this.gameStatus == 'STARTED';
}

Jackpot.prototype.isNotStarted = function()
{
	return this.gameStatus == 'NOT_STARTED';
}

Jackpot.prototype.isFinished = function()
{
	return this.gameStatus == 'FINISHED';
}

Jackpot.prototype.getRoomName = function()
{
	return 'JACKPOT_ROOM_' + this.uniqueId;
}

Jackpot.prototype.getClockRemaining = function(clockName)
{
	return this.timeclockContainer.getClock(clockName).remaining;
}

Jackpot.prototype.getClockElapsed = function(clockName)
{
	return this.timeclockContainer.getClock(clockName).elapsed;
}

Jackpot.prototype.getClock = function(clockName)
{
	return this.timeclockContainer.getClock(clockName);
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
	}
}

Jackpot.prototype.increaseClockOnNewBid = function()
{
	var key 		= 'jackpot_setting_game_clock_seconds_increment_on_bid',
		settings 	= global.ticktockGameState.settings,
		seconds 	= settings.hasOwnProperty(key) && settings[key] != "" ? parseInt(settings[key], 10) : 10;

	this.getClock('game').increaseBy(seconds);
}

Jackpot.prototype.startGame = function()
{
	this.gameStatus = 'STARTED';
	this.startedOn 	= new Date();
	this.updateStatusInDB('STARTED');
}

Jackpot.prototype.updateStatusInDB = function(status)
{
	return JackpotModel.find({where: { id: this.metaData.id } })
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
		clockName 	: 'game',
		duration 	: data.gameClockTime
	},
	{
		clockName 	: 'doomsday',
		duration 	: data.doomsDayTime
	}]);

	// Set update jackpot amoutn callback
	if(this.secondsToIncreaseAmount && this.increaseAmount)
    {
    	this.getClock('game').runEveryXSecond(this.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
    }
}

Jackpot.prototype.updateJackpotAmount = function(elapsed)
{
	this.JackpotAmount = Number(parseFloat(this.JackpotAmount, 10) + parseFloat(this.increaseAmount, 10)).toFixed(2);
	this.sendUpdatedAmountToJackpotSockets();
	this.sendUpdatedAmountToBattleSockets();
}

Jackpot.prototype.sendUpdatedAmountToJackpotSockets = function()
{
	var amount = convertAmountToCommaString(this.JackpotAmount);

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
			if(levels.battleType == 'NORMAL')
			{
				this.normalBattleLevels.push(new NormalBattleLevel(levels[k]));
			}
			else if(levels.battleType == 'GAMBLING')
			{
				this.advanceBattleLevels.push(new AdvanceBattleLevel(levels[k]));
			}
		}
	}
}

Jackpot.prototype.countDownJackpotTimer = function()
{
	this.timeclockContainer.countDown();
}

Jackpot.prototype.countDownBattlesTimer = function()
{
	if(this.normalBattleLevels.length > 0)
	{
		for(var i in this.normalBattleLevels)
		{
			this.normalBattleLevels[i].countDown();
		}
	}

	if(this.advanceBattleLevels.length > 0)
	{
		for(var k in this.advanceBattleLevels)
		{
			this.advanceBattleLevels[k].countDown();
		}
	}
}

Jackpot.prototype.finishGame = function()
{
	var context = this;

	this.gameStatus = 'FINISHED';

	setTimeout(function()
	{
		context.saveDataInDB();
	});
}

Jackpot.prototype.saveDataInDB = function()
{

}

Jackpot.prototype.emitJackpotInfoEverySecond = function()
{
	var roomName = this.getRoomName();

    global.ticktockGameState.jackpotSocketNs.in(roomName).emit(EVT_EMIT_JACKPOT_UPDATE_TIMER, {
        gameClockTime       : this.getClock('game').getFormattedRemaining(),
        doomsDayClockTime   : this.getClock('doomsday').getFormattedRemaining(),
        lastBidDuration     : this.bidContainer.getLastBidDuration(true),
        longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
        longestBidUserName  : this.bidContainer.getLongestBidUserName()
    });
}

Jackpot.prototype.emitBattlesInfoEverySecond = function()
{

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

Jackpot.prototype.emitJackpotAmountEverySecond = function()
{

}

Jackpot.prototype.finishJackpotEverySecond = function()
{
	if(this.getClockRemaining('game') == 0)
    {
        this.finishGame();
    }
}

Jackpot.prototype.finishBattlesEverySecond = function()
{
	var normalBattles 	= this.normalBattleLevels,
		advanceBattles 	= this.advanceBattleLevels;

	if(normalBattles.length > 0)
	{
		for(var i in normalBattles)
		{
			normalBattles[i].finishGameEverySecond();
		}
	}

	if(advanceBattles.length > 0)
	{
		for(var k in advanceBattles)
		{
			advanceBattles[k].finishGameEverySecond();
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

Jackpot.prototype.emitUpdatesToItsRoom = function()
{
	var room = this.getRoomName(),
		data = this.getUpdatedJackpotData();

	global.ticktockGameState.jackpotSocketNs.in(room).emit(EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM, data);
}

Jackpot.prototype.getUpdatedJackpotData = function()
{
	var bidContainer 	= this.bidContainer,
		placedBids 		= bidContainer.getAllBids();

	return {
        totalUsers      : this.getUsers().length,
        activePlayers   : this.getActiveUsers().length,
        remainingPlayers: this.getInActiveUsers().length,
        longestBid      : null,
        averageBidBank  : this.getAverageBidBank(),
        totalBids       : placedBids.length,
        canIBid         : true,
        currentBidUser  : {name: bidContainer.getLastBidUserName()}
    }

	return {};
}

Jackpot.prototype.showConsoleInfoEverySecond = function()
{
	console.log(this.title, this.getClockRemaining('game'), this.getClockRemaining('doomsday'));
}

export default Jackpot;