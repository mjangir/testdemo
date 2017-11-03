'use strict';

import {
	EVT_ON_JACKPOT_BID_PLACED,
	EVT_ON_JACKPOT_GAME_QUITTED
} from '../../constants';

import onQuitGame from './quit-game';
import onPlaceBid from './place-bid';

export default function(socket)
{
	// On bid placed
    socket.on(EVT_ON_JACKPOT_BID_PLACED, onPlaceBid(socket));

    // On game quit
    socket.on(EVT_ON_JACKPOT_GAME_QUITTED, onQuitGame(socket));
}