'use strict';

import BattleGame from '../state/battle/game';

/**
 * Get Previous Socket Room
 * 
 * @param {BattleGame} game 
 * @param {Socket} socket 
 */
function getPreviousSocketRoom(game, socket) {
  var rooms,
      keys,
      previousRoom;

  rooms   = socket.rooms;
  keys    = Object.keys(rooms);

  if(keys.length > 0) {
    for(var p in keys) {
      if(keys[p].indexOf(game.roomPrefix) > -1) {
          previousRoom = keys[p];
      }
    }
  }

  return previousRoom;
}

/**
 * Join User To Bid Battle
 * 
 * @param {BattleLevel} level 
 * @param {JackpotUser} user 
 * @param {BattleGame} game 
 * @param {Socket} socket 
 */
export default function(level, user, game, socket, callback) {
	var previousRoom,
      newRoom;

	if(game instanceof BattleGame) {
    previousRoom    = getPreviousSocketRoom(game, socket);
    newRoom         = game.getRoomName();

    // Leave the old room
    socket.leave(previousRoom, function() {
      socket.join(newRoom);

      if(!game.hasUser(user)) {
          game.addUser(user);
      }

      callback.call(null, level, user, game, socket);
    });
	}
}
