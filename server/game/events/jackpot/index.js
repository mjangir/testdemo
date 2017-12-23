'use strict';

import {
	EVT_ON_JACKPOT_BID_PLACED,
	EVT_ON_JACKPOT_GAME_QUITTED,
	EVT_ON_JACKPOT_REQUEST_BATTLE
} from '../../constants';

import onQuitGame from './quit-game';
import onPlaceBid from './place-bid';
import onRequestBattle from './request-battle';

export default function(socket)
{
	// On bid placed
    socket.on(EVT_ON_JACKPOT_BID_PLACED, onPlaceBid(socket));

    // On game quit
    socket.on(EVT_ON_JACKPOT_GAME_QUITTED, onQuitGame(socket));

    // On request a battle
    socket.on(EVT_ON_JACKPOT_REQUEST_BATTLE, onRequestBattle(socket));
}