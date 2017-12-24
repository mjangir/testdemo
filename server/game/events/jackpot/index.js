'use strict';

import {
	EVT_ON_PLACE_JACKPOT_BID,
	EVT_ON_QUIT_JACKPOT,
	EVT_ON_REQUEST_BATTLE_LEVELS
} from '../../constants';

import onQuitGame from './quit-game';
import onPlaceBid from './place-bid';
import onRequestBattle from './request-battle';

export default function(socket)
{
	// On bid placed
  socket.on(EVT_ON_PLACE_JACKPOT_BID, onPlaceBid(socket));

  // On game quit
  socket.on(EVT_ON_QUIT_JACKPOT, onQuitGame(socket));

  // On request a battle
  socket.on(EVT_ON_REQUEST_BATTLE_LEVELS, onRequestBattle(socket));
}
