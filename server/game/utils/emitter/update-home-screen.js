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

import createConnectionAgain from '../../events/connect';


/**
 * Update Home Screen
 * 
 * @param {JackpotGame} game 
 * @param {String} scene
 * @param {Array} components 
 * @returns {*}
 */
export default function(game, scene, components, socket, battleLevel, battleGame, user) {

  switch (scene) {
    case HOME_SCREEN_SCENE_GAME:
      emitGameScreen(game, components, battleLevel, battleGame, user);
    break;

    case HOME_SCREEN_SCENE_WINNER:
      emitWinnerScreen(game);
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
function emitGameScreen(game, components, battleLevel, battleGame, user) {
  var users,
      data  = {
        scene: HOME_SCREEN_SCENE_GAME
      };

  if(battleGame) {
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

    // One user provided
    if(user) {
      if(_.contains(components, HOME_SCREEN_COMPONENT_MY_INFO) || typeof components == 'undefined') {
        data[HOME_SCREEN_COMPONENT_MY_INFO] = game.getUserInfo(user);
      }

      if(_.contains(components, HOME_SCREEN_COMPONENT_FOOTER) || typeof components == 'undefined') {
        data[HOME_SCREEN_COMPONENT_FOOTER] = game.getUserHomeButtonsInfo(user);
      }

      user.socket.emit(EVT_EMIT_UPDATE_HOME_SCREEN, data);

    } else if(users.length > 0) {
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

/**
 * Emit Winner Data
 * 
 * @param {JackpotGame} game 
 */
function emitWinnerScreen(game) {
  var winnerData  = game.getWinnerData(),
      namespace   = global.ticktockGameState.jackpotSocketNs,
      users       = game.getAllUsers(),
      data        = {
        scene : HOME_SCREEN_SCENE_WINNER,

        winner: {
          longestBidWinner: winnerData.longestBidUser != false ? {
            id:   winnerData.longestBidUser.id,
            name: winnerData.longestBidUser.name
          } : false,

          lastBidWinner: winnerData.lastBidUser != false ? {
            id:   winnerData.lastBidUser.id,
            name: winnerData.lastBidUser.name
          } : false,

          bothAreSame: winnerData.bothAreSame,
          status : true,
          forceFinish: false
        }
      };

  namespace.in(game.getRoomName()).emit(EVT_EMIT_UPDATE_HOME_SCREEN, data);
  
  if(users.length > 0) {
    for(var i = 0; i < users.length; i++) {
      if(users[i].socket) {
        createConnectionAgain(users[i].socket);
      }
    }
  }
}
