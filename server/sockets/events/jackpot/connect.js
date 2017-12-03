'use strict';

import onPlaceBid from './placebid';
import onDisconnect from './disconnect';
import onQuitGame from './quitgame';
import handlePostConnectBattleEvents from '../battle/connect';
import {convertAmountToCommaString, findClientsSocket} from '../../../utils/functions';

import {
    EVT_ON_CLIENT_CONNECTION,
    EVT_ON_CLIENT_DISCONNECT,
    EVT_ON_CLIENT_BID_PLACED,
    EVT_EMIT_ME_JOINED,
    EVT_EMIT_ME_JOINED_ERR,
    EVT_EMIT_CAN_I_PLACE_BID,
    EVT_EMIT_NO_JACKPOT_TO_PLAY,
    EVT_ON_CLIENT_QUITTED_GAME
} from './constants';

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

    if(Object.keys(jackpot.users).length < jackpot.getMetaData().minPlayersRequired)
    {
        global.jackpotSocketNamespace.in(jackpot.getRoomName()).emit(EVT_EMIT_CAN_I_PLACE_BID, {canIBid: false});
    }
    else
    {
        socket.emit(EVT_EMIT_CAN_I_PLACE_BID, {canIBid: (jackpotLastBidUserId != jackpotUserId)});
    }
}

/**
 * Handlers for post connection events
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handlePostConnectEvents(socket)
{
    // On place a bid
    socket.on(EVT_ON_CLIENT_BID_PLACED, onPlaceBid(socket));

    // On socket disconnect
    socket.on(EVT_ON_CLIENT_DISCONNECT, onDisconnect(socket));

    // On quit game by client
    socket.on(EVT_ON_CLIENT_QUITTED_GAME, onQuitGame(socket));

    // Handle Post Connect Battle Evens
    handlePostConnectBattleEvents(socket);
}

/**
 * Handle On Socket Connection
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    var stateInst   = global.globalJackpotSocketState,
        handshake   = socket.handshake,
        userId      = handshake.query.userId,
        userJackpot,
        pickNewJackpot,
        jackpotUser;

    // Get Jackpot to which user is already joined
    userJackpot = stateInst.getUserJackpot(userId);

    // If user is already joined to a jackpot
    if(userJackpot)
    {
        pickNewJackpot = userJackpot;

        // Get that JackpotUser instance
        jackpotUser = userJackpot.getUser(userId);

        jackpotUser.isActive = true;

        // If this jackpot is currently being played and user has not quitted yet OR
        // User is joined earlier but the jackpot still has not started, so he can join the same
        if((userJackpot.isCurrentlyBeingPlayed() && jackpotUser.gameStatus != 'QUITTED') || userJackpot.getMetaData().gameStatus == 'NOT_STARTED')
        {
            socket.currentRoom  = userJackpot.getRoomName();
            socket.jackpot      = userJackpot;
            socket.jackpotUser  = jackpotUser;

            jackpotUser.currentSocket = socket;

            socket.join(userJackpot.getRoomName());

            // User joined to game successfully
            socket.emit(EVT_EMIT_ME_JOINED, {
                jackpotInfo:    {
                    uniqueId:    userJackpot.getMetaData().uniqueId,
                    name:        userJackpot.getMetaData().title,
                    amount:      convertAmountToCommaString(userJackpot.getMetaData().amount)
                },
                userInfo: {
                    name:               jackpotUser.getMetaData().name,
                    availableBids:      jackpotUser.availableBids,
                    totalPlacedBids:    jackpotUser.placedBids.length,
                }
            });
            userJackpot.emitUpdatesToItsRoom();

            // Emit Can I bid event on join
            emitCanIBidOnConnect(socket, userJackpot, jackpotUser);
        }
        else
        {
            // Otherwise pickup a new jackpot which is currently being played and its
            // Doomsday is not overed OR any jackpot which is not started yet
            pickNewJackpot = stateInst.pickupNewJackpot();
        }
    }
    else
    {
        // If this is very new user, get a new jackpot for him
        pickNewJackpot = stateInst.pickupNewJackpot();
    }

    // If this is really new user, add him/her to this jackpot room
    if(typeof pickNewJackpot != 'undefined' && pickNewJackpot !== false)
    {
        pickNewJackpot.addUser(userId, function(error, jackpotUser)
        {
            if(error == null)
            {
                socket.currentRoom  = pickNewJackpot.getRoomName();
                socket.jackpot      = pickNewJackpot;
                socket.jackpotUser  = jackpotUser;

                jackpotUser.currentSocket = socket;

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

    // Handle post connect events
    handlePostConnectEvents(socket);
}
