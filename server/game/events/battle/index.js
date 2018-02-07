'use strict';

import {
	EVT_ON_JOIN_BATTLE,
	EVT_ON_PLACE_BATTLE_BID,
  EVT_ON_QUIT_BATTLE,
  EVT_ON_UNLOCK_BATTLE_LEVEL
} from '../../constants';

import onJoinBattle from './join-battle';
import onQuitGame from './quit-game';
import onPlaceBid from './place-bid';
import unlockBattle from './unlock-battle';

export default function(socket)
{
	// On Join Battle
  socket.on(EVT_ON_JOIN_BATTLE, onJoinBattle(socket));

  // On game quit
  socket.on(EVT_ON_QUIT_BATTLE, onQuitGame(socket));

  // On place battle bid
  socket.on(EVT_ON_PLACE_BATTLE_BID, onPlaceBid(socket));

  // On place battle bid
  socket.on(EVT_ON_UNLOCK_BATTLE_LEVEL, unlockBattle(socket));
}
