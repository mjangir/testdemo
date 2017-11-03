'use strict';

import BidContainer from './bid-container';

function BattleLevelGame()
{
    this.bidContainer = new BidContainer();
}

BattleLevelGame.prototype.placeBid = function()
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

export default BattleLevelGame;