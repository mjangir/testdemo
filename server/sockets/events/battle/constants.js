'use strict';

export const EVT_ON_CLIENT_REQUEST_BATTLE 						= 'request_battle';
export const EVT_CLIENT_JOIN_NORMAL_BATTLE_LEVEL        		= 'request_join_normal_battle_level';
export const EVT_CLIENT_REQUEST_PLACE_NORMAL_BATTLE_LEVEL_BID  	= 'request_place_normal_battle_level_bid';

export const EVT_EMIT_RESPONSE_BATTLE      						= 'response_battle';
export const EVT_EMIT_RESPONSE_JOIN_NORMAL_BATTLE_LEVEL 	 	= 'response_join_normal_battle_level';
export const EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID 	= 'response_place_normal_battle_level_bid';
export const EVT_EMIT_NO_ENOUGH_AVAILABLE_BIDS 					= 'no_enough_available_bids';

export const EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_PLAYER_LIST    = 'update_normal_battle_level_player_list';
export const EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER                 = 'update_normal_battle_level_timer';
export const EVT_EMIT_NORMAL_BATTLE_GAME_STARTED                = 'normal_battle_level_game_started';

export const EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON                 = 'hide_normal_battle_level_place_bid_button';
export const EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON                 = 'show_normal_battle_level_place_bid_button';
export const EVT_EMIT_NBL_GAME_FINISHED                         = 'normal_battle_level_game_finished';

export const EVT_EMIT_UPDATE_AVAILABLE_BID_AFTER_BATTLE_WIN 	= 'update_available_bid_after_battle_win';

export const EVT_EMIT_UPDATE_NORMAL_BATTLE_JACKPOT_AMOUNT 		= 'update_normal_battle_jackpot_amount';
export const EVT_EMIT_NORMAL_BATTLE_MAIN_JACKPOT_FINISHED 		= 'normal_battle_main_jackpot_finished';

export const EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO 			= 'update_home_jackpot_battle_info';
export const EVT_EMIT_NORMAL_BATTLE_GAME_IS_ABOUT_TO_START      = 'normal_battle_game_about_to_start';

// For Gambling
export const EVT_CLIENT_JOIN_GAMBLING_BATTLE_LEVEL                = 'request_join_gambling_battle_level';
export const EVT_CLIENT_REQUEST_PLACE_GAMBLING_BATTLE_LEVEL_BID   = 'request_place_gambling_battle_level_bid';

export const EVT_EMIT_RESPONSE_JOIN_GAMBLING_BATTLE_LEVEL         = 'response_join_gambling_battle_level';
export const EVT_EMIT_RESPONSE_PLACE_GAMBLING_BATTLE_LEVEL_BID    = 'response_place_gambling_battle_level_bid';

export const EVT_EMIT_UPDATE_GAMBLING_BATTLE_LEVEL_PLAYER_LIST    = 'update_gambling_battle_level_player_list';
export const EVT_EMIT_GAMBLING_BATTLE_LEVEL_TIMER                 = 'update_gambling_battle_level_timer';
export const EVT_EMIT_GAMBLING_BATTLE_GAME_STARTED                = 'gambling_battle_level_game_started';

export const EVT_EMIT_HIDE_GBL_PLACE_BID_BUTTON                 = 'hide_gambling_battle_level_place_bid_button';
export const EVT_EMIT_SHOW_GBL_PLACE_BID_BUTTON                 = 'show_gambling_battle_level_place_bid_button';
export const EVT_EMIT_GBL_GAME_FINISHED                         = 'gambling_battle_level_game_finished';

export const EVT_EMIT_UPDATE_GAMBLING_BATTLE_JACKPOT_AMOUNT 	= 'update_gambling_battle_jackpot_amount';
export const EVT_EMIT_GAMBLING_BATTLE_MAIN_JACKPOT_FINISHED 	= 'gambling_battle_main_jackpot_finished';