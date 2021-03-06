'use strict';

import BidContainer from './bid-container';
import TimeclockContainer from './timeclock-container';
import { generateRandomString } from '../../../utils/functions';

function Game(data)
{
	this.bidContainer 		= new BidContainer(this);
	this.timeclockContainer = new TimeclockContainer(this);
	this.gameStatus 		= data.gameStatus ? data.gameStatus : 'NOT_STARTED';
	this.uniqueId 			= generateRandomString(20, 'aA');
}

Game.prototype.isStarted = function()
{
	return this.gameStatus == 'STARTED';
}

Game.prototype.isNotStarted = function()
{
	return this.gameStatus == 'NOT_STARTED';
}

Game.prototype.isFinished = function()
{
	return this.gameStatus == 'FINISHED';
}

Game.prototype.getRoomName = function()
{
	return this.roomPrefix + '_' + this.uniqueId;
}

Game.prototype.getClock = function(clockName)
{
	return this.timeclockContainer.getClock(clockName);
}

Game.prototype.getClockRemaining = function(clockName)
{
	return this.timeclockContainer.getClock(clockName).remaining;
}

Game.prototype.getClockElapsed = function(clockName)
{
	return this.timeclockContainer.getClock(clockName).elapsed;
}

Game.prototype.countDown = function()
{
	this.timeclockContainer.countDown();
}

export default Game;