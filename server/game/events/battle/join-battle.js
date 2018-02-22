import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBidBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattleGame from '../../utils/join-user-to-bid-battle-game';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import updateBattleScreen from '../../utils/emitter/update-battle-screen';
import { 
  MESSAGE_INVALID_INPUT_PROVIDED,
  MESSAGE_NOT_ABLE_TO_JOIN_NORMAL_BATTLE,
  MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE,
  MESSAGE_SOMETHING_WENT_WRONG,
  BATTLE_SCREEN_SCENE_GAME,
  MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE_DOOMSDAY_NOT_OVER
 } from '../../constants';

function handleJoinBattle(socket, data)
{
    var jackpot,
        jackpotGame,
        user,
        battleLevel,
        battleGame,
        gotBattleGame;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false || !data.levelUniqueId)) {
      showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
      return;
    }

    // Get jackpot, user and battle level through socket data
    jackpot     = isJackpotExist(data.jackpotUniqueId);
    jackpotGame = jackpot.game;
    user        = jackpotGame.getUserById(data.userId);
    battleLevel = jackpot.getBattleLevelById(data.levelUniqueId);

    // If no level found with given ID
    if(!battleLevel) {
      showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
      return;
    }
    
    // Check user is eligible to join the battle level
    if(battleLevel.battleType == 'NORMAL' && !battleLevel.isUserAbleToJoin(user)) {
      showErrorPopup(socket, MESSAGE_NOT_ABLE_TO_JOIN_NORMAL_BATTLE);
      return;
    } else if(battleLevel.battleType == 'ADVANCE' && (!jackpotGame.isDoomsDayOver() || !battleLevel.isUserAbleToJoin(user))) {
      if(!jackpotGame.isDoomsDayOver()) {
        showErrorPopup(socket, MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE_DOOMSDAY_NOT_OVER);
      } else if(!battleLevel.isUserAbleToJoin(user)) {
        showErrorPopup(socket, MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE);
      }
      return;
    }

    // Join the battle
    getUserBidBattleGame(battleLevel, user).then(function(data) {
      joinUserToBidBattleGame(data.level, data.user, data.game, socket, function(level, user, game, socket) {
        updateBattleScreen(game, BATTLE_SCREEN_SCENE_GAME);
      });
    });
}

export default function(socket)
{
    return function(data)
    {
        handleJoinBattle(socket, data);
    }
}
