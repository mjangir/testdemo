import {
  BATTLE_SCREEN_SCENE_GAME,
  BATTLE_SCREEN_SCENE_COUNTDOWN,
  BATTLE_SCREEN_SCENE_WINNER,

  BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER,
  BATTLE_SCREEN_COMPONENT_BATTLE_HEADER,
  BATTLE_SCREEN_COMPONENT_BIDS,
  BATTLE_SCREEN_COMPONENT_PLAYERS,
  BATTLE_SCREEN_COMPONENT_MY_INFO,
  BATTLE_SCREEN_COMPONENT_FOOTER,

  EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN
} from '../../constants';
import _ from 'lodash';

/**
 * Update Battle Game Screen
 * 
 * @param {BattleGame} game 
 * @param {String} scene
 * @param {Array} components 
 * @returns {*}
 */
export default function(game, scene, components, socket, data) {

  switch (scene) {
    case BATTLE_SCREEN_SCENE_GAME:
      emitGameScreen(game, components);
    break;

    case BATTLE_SCREEN_SCENE_WINNER:
      emitWinnerScreen(game, data);
    break;

    case BATTLE_SCREEN_SCENE_COUNTDOWN:
      emitCountDownScreen(game, data);
    break;
  
    default:
      break;
  }
}

/**
 * Emit Game Screen On Battle
 * 
 * @param {BattleGame} game 
 * @param {Array} components 
 * @returns {*}
 */
function emitGameScreen(game, components) {
  var users = game.getAllUsers(),
      data  = {
        scene: BATTLE_SCREEN_SCENE_GAME
      };
  
  if(_.contains(components, BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER) || typeof components == 'undefined') {
    data[BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER] = game.getJackpotTimer();
  }

  if(_.contains(components, BATTLE_SCREEN_COMPONENT_BATTLE_HEADER) || typeof components == 'undefined') {
    data[BATTLE_SCREEN_COMPONENT_BATTLE_HEADER] = game.getBattleHeader();
  }

  if(_.contains(components, BATTLE_SCREEN_COMPONENT_BIDS) || typeof components == 'undefined') {
    data[BATTLE_SCREEN_COMPONENT_BIDS] = game.getBidInfo();
  }

  if(_.contains(components, BATTLE_SCREEN_COMPONENT_PLAYERS) || typeof components == 'undefined') {
    data[BATTLE_SCREEN_COMPONENT_PLAYERS] = game.getPlayersInfo();
  }

  if((_.contains(components, BATTLE_SCREEN_COMPONENT_MY_INFO) || _.contains(components, BATTLE_SCREEN_COMPONENT_FOOTER)) || typeof components == 'undefined') {
    if(users.length > 0) {
      for(var i in users) {
        var user = users[i];
  
        if(_.contains(components, BATTLE_SCREEN_COMPONENT_MY_INFO) || typeof components == 'undefined') {
          data[BATTLE_SCREEN_COMPONENT_MY_INFO] = game.getUserInfo(user);
        }
  
        if(_.contains(components, BATTLE_SCREEN_COMPONENT_FOOTER) || typeof components == 'undefined') {
          data[BATTLE_SCREEN_COMPONENT_FOOTER] = game.getBattleButtonsInfo(user);
        }
  
        user.socket.emit(EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN, data);
      }
    }
  }
}

/**
 * Emit Winner Data
 * 
 * @param {BattleGame} game
 * @param {Object} data
 * @returns {*}
 */
function emitWinnerScreen(game, data) {
  var users = game.getAllUsers();

  if(users.length > 0) {
    for(var i in users) {
      var user = users[i];
      user.socket.emit(EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN, {
        scene: BATTLE_SCREEN_SCENE_WINNER,
        data: data
      });
    }
  }
}

/**
 * Emit Count Down
 * 
 * @param {BattleGame} game
 * @param {Object} data
 * @returns {*}
 */
function emitCountDownScreen(game, data) {
  var users = game.getAllUsers();

  if(users.length > 0) {
    for(var i in users) {
      var user = users[i];
      user.socket.emit(EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN, {
        scene: BATTLE_SCREEN_SCENE_COUNTDOWN,
        time: data.time
      });
    }
  }
}
