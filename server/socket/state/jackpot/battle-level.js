'use strict';

function BattleLevel()
{

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

export default BattleLevel;