import {
  LEVEL_SCREEN_SCENE_LEVEL_LIST,
  LEVEL_SCREEN_COMPONENT_LEVELS,
  EVT_EMIT_UPDATE_LEVEL_SCREEN
} from '../../constants';

/**
 * Update Home Screen
 * 
 * @param {JackpotGame} game 
 * @param {JackpotUser} user
 * @returns {*}
 */
export default function(game, user) {
  var data = {'scene': LEVEL_SCREEN_SCENE_LEVEL_LIST};

  data[LEVEL_SCREEN_COMPONENT_LEVELS] = game.getBattleLevelList(user);

  user.socket.emit(EVT_EMIT_UPDATE_LEVEL_SCREEN, data);
}
