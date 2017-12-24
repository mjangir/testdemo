import isJackpotExist from '../../utils/is-jackpot-exist';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import { MESSAGE_INVALID_INPUT_PROVIDED } from '../../constants';

/**
 * Handle Place Bid
 * 
 * @param {Socket} socket 
 * @param {Object} data 
 */
function handlePlacebid(socket, data) {
  var jackpot,
      game,
      user,
      bid;

  if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
  {
      showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
      return;
  }

  jackpot = isJackpotExist(data.jackpotUniqueId);
  game    = jackpot.game;
  user 	  = game.getUserById(data.userId);

  if(user.getJackpotAvailableBids() <= 0) {
    showErrorPopup(socket, MESSAGE_NO_ENOUGH_BID_TO_PLACE);
    return;
  }

  // If this is first bid and jackpot is not started, start it
  if(game && game.isNotStarted()) {
      game.startGame();
  }

  if(game.isStarted())
  {
    bid = game.placeBid(data.userId, socket);
  }
}

/**
 * Handle Place Bid
 * 
 * @param {Socket} socket 
 */
export default function(socket) {
	return function(data) {
		handlePlacebid(socket, data);
	}
}
