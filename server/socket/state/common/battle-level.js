'use strict';

function BattleLevel(data)
{
	this.games = [];
}

BattleLevel.prototype.countDown = function()
{
	if(this.games.length > 0)
	{
		for(var k in this.games)
		{
			this.games[k].countDown();
		}
	}
}

BattleLevel.prototype.finishGameEverySecond = function()
{

}

export default BattleLevel;