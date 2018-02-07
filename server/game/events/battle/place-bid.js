import isJackpotExist from '../../utils/is-jackpot-exist';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import { 
  MESSAGE_INVALID_INPUT_PROVIDED,
  MESSAGE_NO_ENOUGH_BID_TO_PLACE
 } from '../../constants';

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
      bid,
      battleLevel,
      battleGame;

  if(!data || 
    (!data.jackpotUniqueId || 
      !data.userId || 
      isJackpotExist(data.jackpotUniqueId) == false || 
      !data.levelUniqueId ||
      !data.gameUniqueId
    )
  )
  {
      showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
      return;
  }

  jackpot 	  = isJackpotExist(data.jackpotUniqueId);
  game        = jackpot.game;
  user        = game.getUserById(data.userId);
  battleLevel = jackpot.getBattleLevelById(data.levelUniqueId);
  battleGame  = battleLevel ? battleLevel.getGameByUniqueId(data.gameUniqueId) : false;

  // If Game Not Found
  if(!battleGame) {
    showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
    return;
  }

  // If User Has No Enough Bid To Put
  if(user.getBattleAvailableBids(battleLevel, battleGame) <= 0) {
    showErrorPopup(socket, MESSAGE_NO_ENOUGH_BID_TO_PLACE);
    return;
  }

  // Otherwise Place Bid If Game Is Started
  if(battleGame.isStarted()) {
    bid = battleGame.placeBid(data.userId, socket);
  }

}

/**
 * Handle Place Bid
 * 
 * @param {Socket} socket
 */
export default function(socket)
{
	return function(data)
	{
		handlePlacebid(socket, data);
	}
}
