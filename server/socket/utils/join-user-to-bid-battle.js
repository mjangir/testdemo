'use strict';

import NormalBattleLevel from '../state/normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../state/advance-battle/advance-battle-level';
import BattleGame from '../state/common/battle-game';

function getPreviousSocketRoom(game, socket)
{
    var rooms,
        keys,
        previousRoom;

    rooms   = socket.rooms;
    keys    = Object.keys(rooms);

    if(keys.length > 0)
    {
        for(var p in keys)
        {
            if(keys[p].indexOf(game.roomPrefix) > -1)
            {
                previousRoom = keys[p];
            }
        }
    }

    return previousRoom;
}

export default function(level, user, game, socket, data)
{
	var previousRoom,
        newRoom;

	if(game instanceof BattleGame)
	{
        previousRoom    = getPreviousSocketRoom(game, socket);
        newRoom         = game.getRoomName();

        socket.leave(previousRoom, function()
        {

        	socket.join(newRoom);

            if(!game.hasUser(user))
            {
                game.addUser(user);
            }

            user.emitMeJoinedNormalBattle(socket, level, game, data);
            game.startGame();
            user.emitMyBattlePlaceBidButtonToggle(socket, level, game, data);
            game.emitUpdatesToItsRoom(socket);
        });
	}
}