'use strict';

function handlePlaceBid()
{
    
}

export default function(socket)
{
	return function(data)
	{
		handlePlacebid(socket, data);
	}
}