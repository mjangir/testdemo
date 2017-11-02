import onRequestBattle from './requestbattle';
import onPlaceBid from './normal/place-bid';
import joinNormalBattleLevel from './normal/join-battle-level';
import joinGamblingBattleLevel from './gambling/join-battle-level';

import {
	EVT_ON_CLIENT_REQUEST_BATTLE,
	EVT_CLIENT_JOIN_NORMAL_BATTLE_LEVEL,
    EVT_CLIENT_JOIN_GAMBLING_BATTLE_LEVEL,
	EVT_CLIENT_REQUEST_PLACE_NORMAL_BATTLE_LEVEL_BID,
    EVT_CLIENT_REQUEST_PLACE_GAMBLING_BATTLE_LEVEL_BID
} from './constants';

export default function(socket)
{
	// On battle tab click request
    socket.on(EVT_ON_CLIENT_REQUEST_BATTLE, onRequestBattle(socket));

    // On NORMAL battle tab click request
    socket.on(EVT_CLIENT_JOIN_NORMAL_BATTLE_LEVEL, (function(socket){
    	return function(data)
		{
            joinNormalBattleLevel(data, socket);
		}
    }(socket)));

    // On GAMBLING battle tab click request
    socket.on(EVT_CLIENT_JOIN_GAMBLING_BATTLE_LEVEL, (function(socket){
        return function(data)
        {
            joinGamblingBattleLevel(data, socket);
        }
    }(socket)));

    socket.on(EVT_CLIENT_REQUEST_PLACE_NORMAL_BATTLE_LEVEL_BID, onPlaceBid(socket))
}