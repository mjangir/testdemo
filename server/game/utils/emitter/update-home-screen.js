import {
  HOME_SCREEN_SCENE_GAME,
  HOME_SCREEN_SCENE_WINNER,
  HOME_SCREEN_SCENE_NO_JACKPOT,

  HOME_SCREEN_COMPONENT_HEADER,
  HOME_SCREEN_COMPONENT_BIDS,
  HOME_SCREEN_COMPONENT_PLAYERS,
  HOME_SCREEN_COMPONENT_MY_INFO,
  HOME_SCREEN_COMPONENT_FOOTER,

  MESSAGE_NO_JACKPOT_AVAILABLE,

  EVT_EMIT_UPDATE_HOME_SCREEN
} from '../../constants';
import _ from 'lodash';

/**
 * Update Home Screen
 * 
 * @param {JackpotGame} game 
 * @param {String} scene
 * @param {Array} components 
 * @returns {*}
 */
export default function(game, scene, components, socket, battleLevel, battleGame) {

  switch (scene) {
    case HOME_SCREEN_SCENE_GAME:
      emitGameScreen(game, components, battleLevel, battleGame);
    break;

    case HOME_SCREEN_SCENE_WINNER:
      emitWinnerScreen();
    break;

    case HOME_SCREEN_SCENE_NO_JACKPOT:
      emitNoJackpotScreen(socket);
    break;
  
    default:
      break;
  }
}

/**
 * Emit Game Screen On Home
 * 
 * @param {JackpotGame} game 
 * @param {Array} components 
 * @returns {*}
 */
function emitGameScreen(game, components, battleLevel, battleGame) {
  var users,
      data  = {
        scene: HOME_SCREEN_SCENE_GAME
      };

  if(typeof battleGame != 'undefined') {
    users = battleGame.getAllUsers();
  } else {
    users = game.getAllUsers();
  }
  
  if(_.contains(components, HOME_SCREEN_COMPONENT_HEADER) || typeof components == 'undefined') {
    data[HOME_SCREEN_COMPONENT_HEADER] = game.getGameHeaderInfo();
  }

  if(_.contains(components, HOME_SCREEN_COMPONENT_BIDS) || typeof components == 'undefined') {
    data[HOME_SCREEN_COMPONENT_BIDS] = game.getBidInfo();
  }

  if(_.contains(components, HOME_SCREEN_COMPONENT_PLAYERS) || typeof components == 'undefined') {
    data[HOME_SCREEN_COMPONENT_PLAYERS] = game.getPlayersInfo();
  }

  if((_.contains(components, HOME_SCREEN_COMPONENT_MY_INFO) || _.contains(components, HOME_SCREEN_COMPONENT_FOOTER)) || typeof components == 'undefined') {
    if(users.length > 0) {
      for(var i in users) {
        var user = users[i];
  
        if(_.contains(components, HOME_SCREEN_COMPONENT_MY_INFO) || typeof components == 'undefined') {
          data[HOME_SCREEN_COMPONENT_MY_INFO] = game.getUserInfo(user);
        }
  
        if(_.contains(components, HOME_SCREEN_COMPONENT_FOOTER) || typeof components == 'undefined') {
          data[HOME_SCREEN_COMPONENT_FOOTER] = game.getUserHomeButtonsInfo(user);
        }
  
        user.socket.emit(EVT_EMIT_UPDATE_HOME_SCREEN, data);
      }
    }
  }
}

/**
 * Emit No Jackpot Screen
 * 
 * @param {Socket} socket 
 */
function emitNoJackpotScreen(socket) {
  socket.emit(EVT_EMIT_UPDATE_HOME_SCREEN, {
    scene: HOME_SCREEN_SCENE_NO_JACKPOT,
    message: MESSAGE_NO_JACKPOT_AVAILABLE
  });
}
