import isJackpotExist from '../../utils/is-jackpot-exist';
import getUserBidBattleGame from '../../utils/get-user-bid-battle-game';
import joinUserToBidBattleGame from '../../utils/join-user-to-bid-battle-game';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import { 
  MESSAGE_INVALID_INPUT_PROVIDED,
  IN_APP_PURCHASE_SHOW_WINS_TO_UNLOCK_THIS_LEVEL,
  IN_APP_PURCHASE_CANNOT_SKIP_PREVIOUS_LEVELS_TO_UNLOCK,
  THIS_LEVEL_IS_ALREADY_UNLOCKED
 } from '../../constants';

function handleUnlockBattle(socket, data)
{
    var jackpot,
        jackpotGame,
        user,
        battleLevel,
        battleGame,
        gotBattleGame,
        previousLevel,
        winsToUnlockThis,
        previousLevelName,
        currentLevelName,
        winsToUnlockMessage;


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
    if(battleLevel.battleType == 'NORMAL' && !battleLevel.isUserAbleToJoin(user, true)) {

      previousLevel = battleLevel.getPreviousLevel();

      if(previousLevel) {
        previousLevelName = previousLevel.title;

        if(!previousLevel.isUserAbleToJoin(user, true)) {
          winsToUnlockMessage = IN_APP_PURCHASE_CANNOT_SKIP_PREVIOUS_LEVELS_TO_UNLOCK.replace('{previousLevelName}', previousLevelName);
        } else {
          winsToUnlockThis    = user.getWinsToUnlockBattleLevel(battleLevel);
          currentLevelName    = battleLevel.title;
          winsToUnlockMessage = IN_APP_PURCHASE_SHOW_WINS_TO_UNLOCK_THIS_LEVEL.replace('{winsRequired}', winsToUnlockThis).replace('{previouLevelName}', previousLevelName).replace('{currentLevelName}', currentLevelName);
        }

        showErrorPopup(socket, winsToUnlockMessage);
        return;
      } else {
        showErrorPopup(socket, THIS_LEVEL_IS_ALREADY_UNLOCKED);
        return;
      }
    }
}

export default function(socket)
{
    return function(data)
    {
        handleUnlockBattle(socket, data);
    }
}
