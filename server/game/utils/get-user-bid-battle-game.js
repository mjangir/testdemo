'use strict';

/**
 * Check No Battle Game
 * 
 * @param {BattleLevel} level 
 * @param {JackpotUser} user 
 */
function checkNoBattleGame(level, user) {
	var games = level.getAllGames(),
		  game  = false;

	if(games.length == 0) {
		game = level.createNewGame();
	}

	return new Promise(function(resolve, reject) {
    resolve({level:level, user:user, game:game});
  });
}

/**
 * Get Existing Battle Game
 * 
 * @param {BattleLevel} level
 * @param {JackpotUser} user
 * @param {BattleLevel} previous
 */
function getExistingBattleGame(level, user, previous) {
	var games = level.getAllGames(),
		  game 	= previous;

	if(game === false) {
		for(var k in games) {
      if(games[k].getUser(user) && (games[k].isStarted() || games[k].isNotStarted())) {
        game = games[k];
        break;
      }
    }
	}

  return new Promise(function(resolve, reject) {
    resolve({level:level, user:user, game:game});
  });
}

/**
 * Get Available Game Slot
 * 
 * @param {BattleLevel} level 
 * @param {JackpotUser} user 
 * @param {BattleLevel} previous 
 */
function getAvailableGameSlot(level, user, previous) {
	var games = level.getAllGames(),
		  game 	= previous;
	
	if(game === false) {
		game = level.getAvailableGameSlot();
	}
   	
	return new Promise(function(resolve, reject) {
		resolve({level:level, user:user, game:game});
	});
}

/**
 * Create New Battle Game
 * 
 * @param {BattleLevel} level 
 * @param {JackpotUser} user 
 * @param {BattleLevel} previous 
 */
function createNewBattleGame(level, user, previous)
{
	var game = previous;

	if(game == false) {
		game = level.createNewGame();
	}

	return new Promise(function(resolve, reject) {
    resolve({level:level, user:user, game:game});
  });
}

/**
 * Get Battle Game
 */
export default function(level, user) {
  return checkNoBattleGame(level, user).then(function(data) {
    return getExistingBattleGame(level, user, data.game);
  }).then(function(data) {
    return getAvailableGameSlot(level, user, data.game);
  }).then(function(data) {
    return createNewBattleGame(level, user, data.game);
  });
}
