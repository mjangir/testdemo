'use strict';

import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import TimeclockContainer from '../common/timeclock-container';
import JackpotUser from './jackpot-user';
import BidContainer from '../common/bid-container';
import { getUserObjectById, convertAmountToCommaString } from '../../../utils/functions';
import {
	EVT_EMIT_JACKPOT_UPDATE_AMOUNT,
	EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON
} from '../../constants';

function Jackpot(data)
{
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

	this.users 						= [];
	this.normalBattleLevels 		= [];
	this.advanceBattleLevels 		= [];
	this.bidContainer 				= new BidContainer();
	this.timeclockContainer 		= new TimeclockContainer(this);

	// Add Battle Levels
	this.addBattleLevels(data);
	this.setTimeclocks(data);
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
    	this.timeclockContainer.getClock('game').runEveryXSecond(this.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
    }
}

Jackpot.prototype.updateJackpotAmount = function(elapsed)
{
	this.JackpotAmount 	= Number(parseFloat(this.JackpotAmount, 10) + parseFloat(this.increaseAmount, 10)).toFixed(2);
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

Jackpot.prototype.getRoomName = function()
{
	return 'JACKPOT_ROOM_' + this.uniqueId;
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

Jackpot.prototype.placeBid = function(user)
{
	var userId = user instanceof JackpotUser ? user.userId : user;

	return this.bidContainer.placeBid(userId);
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

}

Jackpot.prototype.emitBattlesInfoEverySecond = function()
{

}

Jackpot.prototype.emitShowQuitButton = function()
{
	var gcRemaining = this.timeclockContainer.getClock('game').remaining,
		ddRemaining = this.timeclockContainer.getClock('doomsday').remaining;

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
	if(this.timeclockContainer.getClock('game').remaining == 0)
    {
        this.finishGame();
    }
}

Jackpot.prototype.finishBattlesEverySecond = function()
{
	if(this.normalBattleLevels.length > 0)
	{
		for(var i in this.normalBattleLevels)
		{
			this.normalBattleLevels[i].finishGameEverySecond();
		}
	}

	if(this.advanceBattleLevels.length > 0)
	{
		for(var k in this.advanceBattleLevels)
		{
			this.advanceBattleLevels[k].finishGameEverySecond();
		}
	}
}

Jackpot.prototype.emitSomeoneJoined = function()
{

}

Jackpot.prototype.emitSomeoneQutted = function()
{
	
}

Jackpot.prototype.showConsoleInfoEverySecond = function()
{
	console.log(this.title, this.timeclockContainer.getClock('game').remaining, this.timeclockContainer.getClock('doomsday').remaining);
}

export default Jackpot;