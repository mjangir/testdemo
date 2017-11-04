'use strict';

import BidContainer from './bid-container';

function BattleLevelGame(level)
{
	this.level 			= level;
	this.users 			= [];
    this.bidContainer 	= new BidContainer();
}

BattleLevelGame.prototype.placeBid = function()
{

}

BattleLevelGame.prototype.increaseClockOnNewBid = function()
{

}

BattleLevelGame.prototype.addJackpotUser = function(jackpotUser)
{
	this.users.push(jackpotUser);
}

BattleLevelGame.prototype.countDown = function()
{
	if(this.gameStatus == 'STARTED' && this.durationRemaining  > 0)
	{
		this.durationRemaining -= 1;
	}
}

BattleLevelGame.prototype.finishGameEverySecond = function()
{
	
}

export default BattleLevelGame;