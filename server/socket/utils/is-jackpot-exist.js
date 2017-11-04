'use strict';

export default function(uniqueId)
{
	var jackpots = global.ticktockGameState.jackpots;

	if(jackpots.length == 0)
	{
		return false;
	}

	for(var k in jackpots)
	{
		if(jackpots[k].uniqueId == uniqueId)
		{
			return jackpots[k];
		}
	}

	return false;
}