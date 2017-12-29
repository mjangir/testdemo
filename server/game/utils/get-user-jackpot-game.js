'use strict';

/**
 * Get Current Game
 *
 * @param  {Number} userId
 * @return {Promise}
 */
function getCurrentGame(userId) {
  var jackpots  = global.ticktockGameState.jackpots,
      game      = false,
      jackpotGame,
      jackpotUser;

	for(var k in jackpots) {
    jackpotGame = jackpots[k].game;
    jackpotUser = jackpotGame.getUserById(userId);

    if(jackpotUser !== false && !jackpotUser.isQuitted() && jackpotGame.isStarted()) {
      game = jackpotGame;
      break;
    }
  }

  return new Promise(function(resolve, reject) {
    resolve({game: game, userId: userId});
  });
}

/**
 * Find New Game
 *
 * @param  {Object} data
 * @return {Promise}
 */
function getNewGame(data) {
  var jackpots  = global.ticktockGameState.jackpots,
      game      = data.game,
      userId    = data.userId,
      jackpotGame;

	// First try to get any already started and having doomsday seconds > 0
	if(game == false) {
		for(var k in jackpots) {
      jackpotGame = jackpots[k].game;
      if(jackpotGame.isStarted() && jackpotGame.getRemainingTime('doomsday') > 0) {
        game = jackpotGame;
        break;
      }
    }
	}

	// Then try to get the first not started game
	if(game == false) {
		for(var j in jackpots) {
      jackpotGame = jackpots[j].game;
      if(jackpotGame.isNotStarted()) {
        game = jackpotGame;
        break;
      }
    }
	}

  // Return the promise
	return new Promise(function(resolve, reject) {
		resolve({game: game, userId: userId});
	});
}

/**
 * Get Jackpot Game By User
 * 
 * @param {Number} userId 
 * @returns {Promise}
 */
export default function(userId) {
  return getCurrentGame(userId).then(function(data) {
 		return getNewGame(data);
 	});
}
