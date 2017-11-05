'use strict'

import BattleGame from '../common/battle-game';
import JackpotUser from '../jackpot/jackpot-user';
import { getUserObjectById } from '../../../utils/functions';
import url from 'url';
import config from '../../../config/environment';
import {
	EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS
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



export default NormalBattleGame;