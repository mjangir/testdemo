import {
  EVT_EMIT_UPDATE_APP_HEADER
} from '../../constants';

/**
 * Emit Winner Data
 * 
 * @param {JackpotGame} game 
 */
export default function (game) {
  var namespace   = global.ticktockGameState.jackpotSocketNs;

  namespace.in(game.getRoomName()).emit(EVT_EMIT_UPDATE_APP_HEADER, {
    header: game.getGameHeaderInfo()
  });
}
