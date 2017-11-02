'use strict';

import {
    EVT_EMIT_RESPONSE_JOIN_NORMAL_BATTLE_LEVEL,
    EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON,
    EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON
} from '../constants';
import {convertAmountToCommaString} from '../../../../utils/functions';

export default function(data, socket)
{
	var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
    	jackpotUserInstance     = jackpotInstance.getUser(data.userId),
    	normalBattleContainer   = jackpotInstance.normalBattleContainer,
    	response 				= {status: false},
        currentGame,
        currentLevelGameUser,
        socketCurrentRooms,
        socketRoomKeys,
        previousRoomName,
        requiredUsersToPlay;

    currentGame = normalBattleContainer.getRunningGameByUserAndLevel(jackpotUserInstance, data.levelUniqueId);

    if(!currentGame)
    {
    	currentGame = normalBattleContainer.getNewGameByUserAndLevel(jackpotUserInstance, data.levelUniqueId);
    }

    if(currentGame)
    {
        // Leave From All Previous Rooms
        socketCurrentRooms  = socket.rooms;
        socketRoomKeys      = Object.keys(socketCurrentRooms);

        if(socketRoomKeys.length > 0)
        {
            for(var p in socketRoomKeys)
            {
                if(socketRoomKeys[p].indexOf('JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_') > -1)
                {
                    previousRoomName = socketRoomKeys[p];
                }
            }
        }

        socket.leave(previousRoomName, function()
        {
            socket.join(currentGame.getRoomName());

            // Get current level game user
            currentLevelGameUser = currentGame.getUser(jackpotUserInstance);

            // User joined to game successfully
            socket.emit(EVT_EMIT_RESPONSE_JOIN_NORMAL_BATTLE_LEVEL, {

                jackpotInfo:    {
                    uniqueId:    jackpotInstance.getMetaData().uniqueId,
                    name:        jackpotInstance.getMetaData().title,
                    amount:      convertAmountToCommaString(jackpotInstance.getMetaData().amount)
                },
                levelInfo: {
                    uniqueId    : currentGame.level.uniqueId,
                    levelName   : currentGame.level.metaData.levelName,
                    prizeValue  : currentGame.level.metaData.prizeValue,
                    prizeType   : currentGame.level.metaData.prizeType
                },
                myInfo: {
                    userId:             currentLevelGameUser.jackpotUser.getMetaData().id,
                    name:               currentLevelGameUser.jackpotUser.getMetaData().name,
                    availableBids:      currentLevelGameUser.availableBids,
                    totalPlacedBids:    currentLevelGameUser.bids.length
                },
                gameInfo: {
                    duration : currentGame.getHumanDuration(),
                    uniqueId : currentGame.gameId
                },
                players             : currentGame.getAllActiveUsersInfo(),
                currentBidUser      : currentGame.getLastBidUser() == null ? null : currentGame.getLastBidUser().jackpotUser.metaData.name,
                currentBidDuration  : currentGame.getLastBid() == null ? null : currentGame.getLastBid().duration,
                longestBidUser      : currentGame.getLongestBidUser() == null ? null : currentGame.getLongestBidUser().jackpotUser.metaData.name,
                longestBidDuration  : currentGame.getLongestBid() == null ? null : currentGame.getLongestBid().duration,
            });

            // Start the game in case of min user reached
            requiredUsersToPlay = currentGame.level.metaData.minPlayersRequiredToStart;

            if(!currentGame.isRunning() && currentGame.users.length == requiredUsersToPlay)
            {
                currentGame.startGame();
            }

            if( currentGame.isNotStarted() || 
                (currentGame.getLastBid() != null && 
                currentGame.getLastBid().user.jackpotUser.metaData.id != currentLevelGameUser.jackpotUser.getMetaData().id))
            {
                socket.emit(EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON);
            }
            else
            {
                socket.emit(EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON);
            }

            // Broadcast to all users
            currentGame.emitUpdatesToItsRoom(socket)
        });
    }
}