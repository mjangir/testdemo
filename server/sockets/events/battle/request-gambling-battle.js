'use strict';

import {
    EVT_EMIT_RESPONSE_BATTLE,
    EVT_EMIT_SHOW_GBL_PLACE_BID_BUTTON,
    EVT_EMIT_HIDE_GBL_PLACE_BID_BUTTON
} from './constants';
import {convertAmountToCommaString} from '../../../utils/functions';

export default function(data, socket)
{
    var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
        jackpotUserInstance     = jackpotInstance.getUser(data.userId),
        gamblingBattleContainer = jackpotInstance.gamblingBattleContainer,
        battleLevelsList        = gamblingBattleContainer.getBattleLevelListByUser(jackpotUserInstance),
        currentlyPlayingGame    = gamblingBattleContainer.getRunningGameByUser(jackpotUserInstance),
        currentGameInfo         = false,
        myGameUserInstance,
        socketCurrentRooms,
        socketRoomKeys,
        previousRoomName,
        response;

    if(currentlyPlayingGame)
    {
        // Leave From All Previous Rooms
        socketCurrentRooms  = socket.rooms;
        socketRoomKeys      = Object.keys(socketCurrentRooms);

        if(socketRoomKeys.length > 0)
        {
            for(var p in socketRoomKeys)
            {
                if(socketRoomKeys[p].indexOf('JACKPOT_GAMBLING_BATTLE_LEVEL_ROOM_') > -1)
                {
                    previousRoomName = socketRoomKeys[p];
                }
            }
        }

        // Leave from old Room and join again
        socket.leave(previousRoomName, function()
        {
            socket.join(currentlyPlayingGame.getRoomName());

            myGameUserInstance = currentlyPlayingGame.getUser(jackpotUserInstance);

            currentGameInfo = {
                jackpotInfo:    {
                    uniqueId:    jackpotInstance.getMetaData().uniqueId,
                    name:        jackpotInstance.getMetaData().title,
                    amount:      convertAmountToCommaString(jackpotInstance.getMetaData().amount)
                },
                levelInfo: {
                    uniqueId    : currentlyPlayingGame.level.uniqueId,
                    levelName   : currentlyPlayingGame.level.metaData.levelName,
                    minBidsToGamb: currentlyPlayingGame.level.metaData.minBidsToGamb,
                    prizeType   : currentlyPlayingGame.level.metaData.prizeType
                },
                myInfo: {
                    userId:             myGameUserInstance.jackpotUser.getMetaData().id,
                    name:               myGameUserInstance.jackpotUser.getMetaData().name,
                    availableBids:      myGameUserInstance.availableBids,
                    totalPlacedBids:    myGameUserInstance.bids.length,
                    bidsForGambling:    myGameUserInstance.bidsForGambling,
                },
                gameInfo: {
                    duration : currentlyPlayingGame.getHumanDuration(),
                    uniqueId : currentlyPlayingGame.gameId
                },
                players             : currentlyPlayingGame.getAllActiveUsersInfo(),
                currentBidUser      : currentlyPlayingGame.getLastBidUser() == null ? null : currentlyPlayingGame.getLastBidUser().jackpotUser.metaData.name,
                currentBidDuration  : currentlyPlayingGame.getLastBid() == null ? null : currentlyPlayingGame.getLastBid().duration,
                longestBidUser      : currentlyPlayingGame.getLongestBidUser() == null ? null : currentlyPlayingGame.getLongestBidUser().jackpotUser.metaData.name,
                longestBidDuration  : currentlyPlayingGame.getLongestBid() == null ? null : currentlyPlayingGame.getLongestBid().duration,
            };

            response = {
                battleType         : 'GAMBLING',
                battleLevelsList   : battleLevelsList,
                currentGameInfo    : currentGameInfo
            };

            if( currentlyPlayingGame.isNotStarted() ||
                (currentlyPlayingGame.getLastBid() != null &&
                currentlyPlayingGame.getLastBid().user.jackpotUser.metaData.id != myGameUserInstance.jackpotUser.getMetaData().id))
            {
                socket.emit(EVT_EMIT_HIDE_GBL_PLACE_BID_BUTTON);
            }
            else
            {
                socket.emit(EVT_EMIT_SHOW_GBL_PLACE_BID_BUTTON);
            }

            socket.emit(EVT_EMIT_RESPONSE_BATTLE, response);

        });
    }
    else
    {
        response = {
            battleType         : 'GAMBLING',
            battleLevelsList   : battleLevelsList,
            currentGameInfo    : currentGameInfo
        }
        socket.emit(EVT_EMIT_RESPONSE_BATTLE, response);
    }
}