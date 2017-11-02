'use strict';

import {
    EVT_EMIT_CAN_I_PLACE_BID,
    EVT_EMIT_MY_BID_PLACED
} from './constants';

/**
 * Handle on place bid
 *
 * @param  {Object} data
 * @param  {Socket} socket
 * @return {*}
 */
function handlePlaceNewBid(data, socket)
{
    var jackpotInstance,
        jackpotUserInstance,
        newBid;

    // If jackpot or user ID is not valid, throw error
    if(data && (!data.jackpotUniqueId || !data.userId || !global.globalJackpotSocketState.hasJackpot(data.jackpotUniqueId)))
    {
        socket.emit('place_bid_error', {
            error: "Invalid User or Jackpot ID"
        });
    }
    else
    {
        // Get corresponding jackpot and user instances
        jackpotInstance     = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId);
        jackpotUserInstance = jackpotInstance.getUser(data.userId);
    }

    // If this is first bid and jackpot is not started, start it
    if(jackpotInstance && jackpotInstance.isNotStarted())
    {
        jackpotInstance.startGame();
    }

    // Place the bid in corresponding user account
    newBid = jackpotUserInstance.placeNewBid();

    // Increase the game clock by 10 second
    // TODO (Need to make it dynamic)
    jackpotInstance.increaseGameClockOnNewBid();

    // Once the new bid is place, update last bid duration and make it
    // last bid for the jackpot
    jackpotInstance.updateLastBidDuration(newBid, jackpotUserInstance);

    // Emit user's own  updated data after placing this bid
    socket.emit(EVT_EMIT_MY_BID_PLACED, {
        availableBids:          jackpotUserInstance.availableBids,
        totalPlacedBids:        jackpotUserInstance.placedBids.length,
        myLongestBidDuration:   jackpotUserInstance.getMyLongestBidDuration()
    });

    // Emit the newly updated jackpot data to all members of its room
    // after placing this new bid
    jackpotInstance.emitUpdatesToItsRoom();

    // The socket who place this bid is not eligible to put a bid
    // again immediately
    socket.emit(EVT_EMIT_CAN_I_PLACE_BID, {canIBid: false});
}

/**
 * Export default onConnect handler
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    return function(data)
    {
        handlePlaceNewBid(data, socket);
    };
}

