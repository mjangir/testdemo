'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import { 
	EVT_EMIT_JACKPOT_PLACE_BID_ERROR,
    EVT_EMIT_NO_ENOUGH_BIDS
} from '../../constants';


function handlePlacebid(socket, data)
{
	var jackpot,
		user,
		bid;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
    {
        socket.emit(EVT_EMIT_JACKPOT_PLACE_BID_ERROR, {
            error: "Invalid User or Jackpot ID"
        });
        return;
    }

    jackpot = isJackpotExist(data.jackpotUniqueId);
    user 	= jackpot.getUserById(data.userId);

    if(user.getJackpotAvailableBids() <= 0)
    {
        user.emitNoEnoughJackpotBids(socket);
        return;
    }

    // If this is first bid and jackpot is not started, start it
    if(jackpot && jackpot.isNotStarted())
    {
        jackpot.startGame();
    }

    if(jackpot.isStarted())
    {
        // Place the bid in corresponding user account
        bid = jackpot.placeBid(data.userId, socket);
    }
}

export default function(socket)
{
	return function(data)
	{
		handlePlacebid(socket, data);
	}
}