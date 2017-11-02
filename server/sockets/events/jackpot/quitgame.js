'use strict';

import {
    EVT_EMIT_CAN_I_PLACE_BID,
    EVT_EMIT_NO_JACKPOT_TO_PLAY,
    EVT_EMIT_GAME_QUITTED,
    EVT_EMIT_ME_JOINED,
    EVT_EMIT_ME_JOINED_ERR
} from './constants';
import {convertAmountToCommaString} from '../../../utils/functions';

/**
 * Emit can I bid on connect
 *
 * @param  {Socket} socket
 * @param  {Jackpot} jackpot
 * @param {JackpotUser} jackpotUser
 * @return {*}
 */
function emitCanIBidOnConnect(socket, jackpot, jackpotUser)
{
    var jackpotLastBidUser      = jackpot.lastBidUser,
        jackpotLastBidUserId    = jackpotLastBidUser != null ? jackpotLastBidUser.getMetaData().id : false,
        jackpotUserId           = jackpotUser.getMetaData().id;

    socket.emit(EVT_EMIT_CAN_I_PLACE_BID, {canIBid: (jackpotLastBidUserId != jackpotUserId)});
}

/**
 * Handle On Game Quit By User
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handleOnQuitGame(data, socket)
{
    var stateInst,
        userJackpot,
        jackpotUser,
        pickNewJackpot,
        userId;

    // If user ID is not valid, throw error
    if(!data.userId)
    {
        socket.emit('place_bid_error', {
            error: "Invalid User ID"
        });
    }
    else
    {
    	userId 		= data.userId;
    	stateInst 	= global.globalJackpotSocketState;
	    userJackpot = stateInst.getUserJackpot(userId);
    }

    if(userJackpot)
    {
    	// Get that JackpotUser instance
        jackpotUser = userJackpot.getUser(userId);

        // Leave the romm for this jackpot now
        socket.leave(userJackpot.getRoomName(), function()
        {
            // Make this user's online staus active for this jackpot and game status too
            jackpotUser.isActive    = false;
            jackpotUser.gameStatus  = 'QUITTED';

            // Emit event to this user that he has been quitted from this game
            socket.emit(EVT_EMIT_GAME_QUITTED, {status: true});

            userJackpot.emitUpdatesToItsRoom();

            // Get a new jackpot for this user to join a new game
            pickNewJackpot = stateInst.pickupNewJackpot();

            // If new jackpot found
            if(pickNewJackpot)
            {
                pickNewJackpot.addUser(userId, function(error, jackpotUser)
                {
                    if(error == null)
                    {
                        socket.currentRoom  = pickNewJackpot.getRoomName();
                        socket.jackpot      = pickNewJackpot;
                        socket.jackpotUser  = jackpotUser;

                        socket.join(pickNewJackpot.getRoomName());

                        // User joined to game successfully
                        socket.emit(EVT_EMIT_ME_JOINED, {
                            jackpotInfo:    {
                                uniqueId:    pickNewJackpot.getMetaData().uniqueId,
                                name:        pickNewJackpot.getMetaData().title,
                                amount:      convertAmountToCommaString(pickNewJackpot.getMetaData().amount)
                            },
                            userInfo: {
                                name:               jackpotUser.getMetaData().name,
                                availableBids:      jackpotUser.availableBids,
                                totalPlacedBids:    jackpotUser.placedBids.length,
                            }
                        });

                        pickNewJackpot.emitUpdatesToItsRoom();

                        // Emit Can I bid event on join
                        emitCanIBidOnConnect(socket, pickNewJackpot, jackpotUser);
                    }
                    else
                    {
                        socket.emit(EVT_EMIT_ME_JOINED_ERR, {error: error});
                    }
                });
            }
            else
            {
                socket.emit(EVT_EMIT_NO_JACKPOT_TO_PLAY, {error: "No Jackpot Found To Play. Please try again after some time"});
            }
        });
    }
    
}

/**
 * Export default onQuitGame handler
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    return function(data)
    {
        handleOnQuitGame(data, socket);
    };
}