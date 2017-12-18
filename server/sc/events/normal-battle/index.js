'use strict';

import {
	EVT_ON_NORMAL_BATTLE_JOIN_GAME,
	EVT_ON_NORMAL_BATTLE_PLACE_BID,
	EVT_ON_NORMAL_BATTLE_QUIT_GAME
} from '../../constants';

import onJoinBattle from './join-battle';
import onQuitBattle from './quit-game';
import onPlaceBid from './place-bid';

export default function(socket)
{
	// On join battle
    socket.on(EVT_ON_NORMAL_BATTLE_JOIN_GAME, onJoinBattle(socket));

    // On place bid
    socket.on(EVT_ON_NORMAL_BATTLE_PLACE_BID, onPlaceBid(socket));

    // On quit battle
    socket.on(EVT_ON_NORMAL_BATTLE_QUIT_GAME, onQuitBattle(socket));
}