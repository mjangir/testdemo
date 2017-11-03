'use strict';

import NormalBattleLevel from './normal-battle/normal-battle-level';
import AdvanceBattleLevel from './advance-battle/advance-battle-level';
import JackpotUser from './jackpot-user';
import BidContainer from '../bid-container';
import { getUserObjectById } from '../../../utils/functions';

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

	// Add Battle Levels
	this.addBattleLevels(data);
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
	if(this.gameClockRemaining  > 0)
    {
        this.gameClockRemaining -= 1;
    }
    if(this.doomsdayClockRemaining  > 0)
    {
        this.doomsdayClockRemaining -= 1;
    }
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

}

Jackpot.prototype.emitJackpotAmountEverySecond = function()
{

}

Jackpot.prototype.emitSomeoneJoined = function()
{

}

Jackpot.prototype.showConsoleInfoEverySecond = function()
{
	console.log(this.title, this.gameClockRemaining, this.doomsdayClockRemaining);
}

export default Jackpot;