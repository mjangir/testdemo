/**
 * Join User To Jackpot Game
 * 
 * @param {JackpotGame} game 
 * @param {Socket} socket 
 * @param {Number} userId 
 */
export default function(game, socket, userId) {
	return new Promise(function(resolve, reject) {
    if(game !== false) {
      var user = game.getUserById(userId) || game.addUserById(userId),
          room = game.getRoomName();

      user.isActive = true;
      user.socket 	= socket;
      socket.user   = user;

      socket.join(room);
      resolve({game: game, socket: socket, user: user});
    } else {
      reject(false);
    }
	});
}
