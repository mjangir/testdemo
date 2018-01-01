'use strict';

/**
 * Jackpot ON events
 */
export const EVT_ON_APP_CONNECT            = 'connection';
export const EVT_ON_APP_DISCONNECT         = 'disconnect';
export const EVT_ON_PLACE_JACKPOT_BID      = 'place_jackpot_bid';
export const EVT_ON_QUIT_JACKPOT           = 'quit_jackpot';

/**
 * Battle ON events
 */
export const EVT_ON_REQUEST_BATTLE_LEVELS  = 'request_battle_levels';
export const EVT_ON_JOIN_BATTLE            = 'join_battle';
export const EVT_ON_PLACE_BATTLE_BID       = 'place_battle_bid';
export const EVT_ON_QUIT_BATTLE            = 'quit_battle';

/**
 * EMIT events
 */
export const EVT_EMIT_UPDATE_HOME_SCREEN            = 'update_home_screen';
export const EVT_EMIT_UPDATE_LEVEL_SCREEN           = 'update_level_screen';
export const EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN     = 'update_battle_game_screen';
export const EVT_EMIT_SHOW_ERROR_POPUP              = 'show_error_popup';

// Home Screen Scene export constants
export const HOME_SCREEN_SCENE_GAME        = 'game';
export const HOME_SCREEN_SCENE_WINNER      = 'winner';
export const HOME_SCREEN_SCENE_NO_JACKPOT  = 'no_jackpot';

// Levels List Screen Scene export constants
export const LEVEL_SCREEN_SCENE_LEVEL_LIST = 'level_list';

// Battle Game Screen Scene
export const BATTLE_SCREEN_SCENE_GAME       = 'game';
export const BATTLE_SCREEN_SCENE_COUNTDOWN  = 'countdown';
export const BATTLE_SCREEN_SCENE_WINNER     = 'winner';



// Home Screen Component export constants
export const HOME_SCREEN_COMPONENT_HEADER  = 'header';
export const HOME_SCREEN_COMPONENT_BIDS    = 'bids';
export const HOME_SCREEN_COMPONENT_PLAYERS = 'players';
export const HOME_SCREEN_COMPONENT_MY_INFO = 'my_info';
export const HOME_SCREEN_COMPONENT_FOOTER  = 'footer';

// Levels List Screen Component export constants
export const LEVEL_SCREEN_COMPONENT_LEVELS = 'levels';

// Battle Screen Component export constants
export const BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER  = 'jackpot_timer';
export const BATTLE_SCREEN_COMPONENT_BATTLE_HEADER  = 'header';
export const BATTLE_SCREEN_COMPONENT_BIDS           = 'bids';
export const BATTLE_SCREEN_COMPONENT_PLAYERS        = 'players';
export const BATTLE_SCREEN_COMPONENT_MY_INFO        = 'my_info';
export const BATTLE_SCREEN_COMPONENT_FOOTER         = 'footer';



/**
 * Messages
 */
export const MESSAGE_NO_JACKPOT_AVAILABLE             = 'No Jackpot Available To Play Right Now. Please Come Later.';
export const MESSAGE_INVALID_INPUT_PROVIDED           = 'Invalid Input Parameters Provided';
export const MESSAGE_NO_ENOUGH_BID_TO_PLACE           = 'You Don\'t Have Enough Bids To Place';
export const CONSECUTIVE_BIDS_ERROR                   = 'You Cannot Put Consecutive Bids';
export const MESSAGE_NOT_ABLE_TO_JOIN_NORMAL_BATTLE   = 'You are not able to join this battle. Please check your unlocked levels.';
export const MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE  = 'You do not have enough bid bank to join this level.';
export const MESSAGE_SOMETHING_WENT_WRONG             = 'Something went wrong. Please try again later.';
