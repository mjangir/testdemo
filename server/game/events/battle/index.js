'use strict';

import {
	EVT_ON_JOIN_BATTLE,
	EVT_ON_PLACE_BATTLE_BID,
	EVT_ON_QUIT_BATTLE
} from '../../constants';

import onJoinBattle from './join-battle';
import onQuitGame from './quit-game';
import onPlaceBid from './place-bid';

export default function(socket)
{
	// On Join Battle
  socket.on(EVT_ON_JOIN_BATTLE, onJoinBattle(socket));

  // On game quit
  socket.on(EVT_ON_QUIT_BATTLE, onQuitGame(socket));

  // On place battle bid
  socket.on(EVT_ON_PLACE_BATTLE_BID, onPlaceBid(socket));
}

