'use strict';

import isJackpotExist from '../../utils/is-jackpot-exist';
import JackpotUser from '../../state/jackpot/jackpot-user';
import updateLevelScreen from '../../utils/emitter/update-level-screen';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import { MESSAGE_INVALID_INPUT_PROVIDED } from '../../constants';

function handleRequestBattle(socket, data)
{
    var jackpot,
        game,
        user;

    if(!data || (!data.jackpotUniqueId || !data.userId || isJackpotExist(data.jackpotUniqueId) == false))
    {
      showErrorPopup(socket, MESSAGE_INVALID_INPUT_PROVIDED);
    }

    jackpot = isJackpotExist(data.jackpotUniqueId);
    game    = jackpot.game;
    user    = game.getUserById(data.userId);

    if(user) {
      updateLevelScreen(game, user);
    }
}

export default function(socket)
{
    return function(data)
    {
        handleRequestBattle(socket, data);
    }
}
