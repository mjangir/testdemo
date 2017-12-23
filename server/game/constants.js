'use strict';

/**
 * Jackpot ON events
 */
const EVT_ON_APP_CONNECT            = 'connection';
const EVT_ON_APP_DISCONNECT         = 'disconnect';
const EVT_ON_PLACE_JACKPOT_BID      = 'place_jackpot_bid';
const EVT_ON_QUIT_JACKPOT           = 'quit_jackpot';

/**
 * Battle ON events
 */
const EVT_ON_REQUEST_BATTLE_LEVELS  = 'request_battle_levels';
const EVT_ON_JOIN_BATTLE            = 'join_battle';
const EVT_ON_PLACE_BATTLE_BID       = 'place_battle_bid';
const EVT_ON_QUIT_BATTLE            = 'quit_battle';

/**
 * EMIT events
 */
const UPDATE_HOME_SCREEN            = 'update_home_screen';
const UPDATE_LEVEL_SCREEN           = 'update_level_screen';
const UPDATE_BATTLE_GAME_SCREEN     = 'update_battle_game_screen';
