'use strict';

function handleQuitGame()
{
    
}

export default function(socket)
{
	return function(data)
	{
		handleQuitGame(socket, data);
	}
}