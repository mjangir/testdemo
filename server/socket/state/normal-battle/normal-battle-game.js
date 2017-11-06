'use strict'

import BattleGame from '../common/battle-game';
import JackpotUser from '../jackpot/jackpot-user';
import { getUserObjectById } from '../../../utils/functions';
import url from 'url';
import config from '../../../config/environment';
import {
	EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS,
	EVT_EMIT_NORMAL_BATTLE_GAME_STARTED,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START,
	EVT_EMIT_NORMAL_BATTLE_TIMER
} from '../../constants';

const avatarUrl = url.format({
    protocol:   config.protocol,
    hostname:   config.ip,
    port:       config.port,
    pathname:   'images/avatar.jpg',
});

function NormalBattleGame(level)
{
	BattleGame.call(this, level);

	this.roomPrefix = 'NORMAL_BATTLE_SOCKET_ROOM';
}

NormalBattleGame.prototype = Object.create(BattleGame.prototype);

NormalBattleGame.prototype.getAllPlayersList = function()
{
	var users 	= this.getAllUsers(),
		players = [],
		user,
		name,
		placedBids,
		availableBids,
		remainingBids;

	for(var k in users)
	{
		user 			= users[k];
		name 			= getUserObjectById(user.userId).name;
		placedBids 		= user.getNormalBattlePlacedBids(this.level, this).length;
		availableBids 	= user.getNormalBattleAvailableBids(this.level, this);
		remainingBids 	= availableBids - placedBids;

		players.push({
			userId 			: user.userId,
			name 			: name,
			picture 		: avatarUrl,
			totalBids 		: placedBids,
			remainingBids 	: remainingBids
		});
	}

	return players;
}

NormalBattleGame.prototype.emitUpdatesToItsRoom = function(socket)
{
	var room 	= this.getRoomName(),
		players = this.getAllPlayersList(),
		sendTo 	= typeof socket != 'undefined' ? socket.broadcast : global.ticktockGameState.jackpotSocketNs;

	sendTo.in(room).emit(EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS, {players: players});
}

NormalBattleGame.prototype.startGame = function()
{
    var minPlayers = this.level.minPlayersRequired;

    if(!this.isStarted() && this.getAllUsers().length >= minPlayers)
    {
        var socketNs 	= global.ticktockGameState.jackpotSocketNs,
        	room 		= this.getRoomName(),
        	context 	= this,
	        time    	= 10 * 1000,
	        i       	= 1000,
	        countdn 	= time,
	        interval;

	    interval = (function(i, time, context)
	    {
	        return setInterval(function()
	        {
	            if(i > time)
	            {
	                context.gameStatus = 'STARTED';
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_GAME_STARTED, {status: true});
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID, {status: true});
	                clearInterval(interval);
	            }
	            else
	            {
	            	socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID, {status: true});
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START, {time: parseInt(countdn/1000, 10)});
	                countdn -= 1000;
	            }

	            i += 1000;

	        }, i);

	    }(i, time, context));
    }
}



export default NormalBattleGame;