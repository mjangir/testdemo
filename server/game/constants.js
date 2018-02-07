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
export const EVT_ON_REQUEST_BATTLE_LEVELS   = 'request_battle_levels';
export const EVT_ON_JOIN_BATTLE             = 'join_battle';
export const EVT_ON_PLACE_BATTLE_BID        = 'place_battle_bid';
export const EVT_ON_QUIT_BATTLE             = 'quit_battle';
export const EVT_ON_UNLOCK_BATTLE_LEVEL     = 'unlock_battle';

/**
 * EMIT events
 */
export const EVT_EMIT_UPDATE_HOME_SCREEN            = 'update_home_screen';
export const EVT_EMIT_UPDATE_LEVEL_SCREEN           = 'update_level_screen';
export const EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN     = 'update_battle_game_screen';
export const EVT_EMIT_SHOW_ERROR_POPUP              = 'show_error_popup';
export const EVT_EMIT_UPDATE_APP_HEADER             = 'update_app_header';

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
export const MESSAGE_NO_JACKPOT_AVAILABLE                               = 'No Jackpot Available To Play Right Now. Please Come Later.';
export const MESSAGE_INVALID_INPUT_PROVIDED                             = 'Invalid Input Parameters Provided';
export const MESSAGE_NO_ENOUGH_BID_TO_PLACE                             = 'You don\'t have enough bids to play this game anymore';
export const CONSECUTIVE_BIDS_ERROR                                     = 'You Cannot Put Consecutive Bids';
export const MESSAGE_NOT_ABLE_TO_JOIN_NORMAL_BATTLE                     = 'You are not able to join this battle. Please check your unlocked levels.';
export const MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE                    = 'You do not have enough bid bank to join this level.';
export const MESSAGE_SOMETHING_WENT_WRONG                               = 'Something went wrong. Please try again later.';
export const MESSAGE_NOT_ABLE_TO_JOIN_ADVANCE_BATTLE_DOOMSDAY_NOT_OVER  = 'You can only join advance battle once the doomsday clock is over';
export const HAVE_BEEN_ELIMINATED_PLEASE_JOIN_NEXT_JACKPOT_GAME         = 'You have 0 Bids remaining and have been Eliminated from this game.  Please Join the next Jackpot Game to continue playing.';
export const IN_APP_PURCHASE_SHOW_WINS_TO_UNLOCK_THIS_LEVEL             = '{winsRequired} {previouLevelName} wins remaining to unlock {currentLevelName} or Unlock now for $.99';
export const IN_APP_PURCHASE_CANNOT_SKIP_PREVIOUS_LEVELS_TO_UNLOCK      = 'You must unlock {previousLevelName} before unlocking this Level, or pay to unlock all Levels now';
export const THIS_LEVEL_IS_ALREADY_UNLOCKED                             = 'This level is already unlocked';
