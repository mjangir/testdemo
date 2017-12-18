'use strict';

// Global Constants
export const EVT_ON_CLIENT_CONNECTION  						= 'connection';
export const EVT_ON_CLIENT_DISCONNECT 						= 'disconnect';
export const EVT_EMIT_ON_CLIENT_DISCONNECT 					= 'updated_jackpot_data';
export const EVT_EMIT_NO_ENOUGH_BIDS                        = 'no_enough_available_bids';
export const EVT_EMIT_SOMETHING_WENT_WRONG                  = 'something_went_wrong';

// Jackpot Specific Constants
export const EVT_ON_JACKPOT_BID_PLACED   					= 'place_bid';
export const EVT_ON_JACKPOT_GAME_QUITTED 					= 'quit_jackpot_game';
export const EVT_ON_JACKPOT_REQUEST_BATTLE 					= 'request_battle';

export const EVT_EMIT_JACKPOT_NO_JACKPOT_TO_PLAY 			= 'no_jackpot_to_play';
export const EVT_EMIT_JACKPOT_CAN_I_BID       				= 'can_i_bid';
export const EVT_EMIT_JACKPOT_GAME_JOINED          			= 'me_joined';
export const EVT_EMIT_JACKPOT_UPDATE_AMOUNT 				= 'update_jackpot_amount';
export const EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON      		= 'show_quit_button';
export const EVT_EMIT_JACKPOT_GAME_QUITTED    				= 'game_quitted';
export const EVT_EMIT_JACKPOT_BID_PLACED         			= 'my_bid_placed';
export const EVT_EMIT_JACKPOT_PLACE_BID_ERROR 				= 'place_bid_error';
export const EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM   		= 'updated_jackpot_data';
export const EVT_EMIT_JACKPOT_UPDATE_TIMER  				= 'update_jackpot_timer';
export const EVT_EMIT_JACKPOT_RESPONSE_BATTLE 				= 'response_battle';
export const EVT_EMIT_JACKPOT_AVAILABLE_BID_ON_BATTLE_WIN 	= 'update_available_bid_after_battle_win';
export const EVT_EMIT_JACKPOT_UPDATE_BATTLE_STREAK 			= 'update_home_jackpot_battle_info';
export const EVT_EMIT_JACKPOT_MY_INFO_CHANGED               = 'jackpot_my_info_changed';
export const EVT_EMIT_JACKPOT_GAME_FINISHED         = 'game_finished';
export const EVT_EMIT_JACKPOT_DOOMSDAY_OVER         = 'jackpot_doomsday_over';


// Jackpot Normal Battle Specific Constants
export const EVT_ON_NORMAL_BATTLE_JOIN_GAME       		    = 'request_join_normal_battle_level';
export const EVT_ON_NORMAL_BATTLE_PLACE_BID  				= 'request_place_normal_battle_level_bid';
export const EVT_ON_NORMAL_BATTLE_QUIT_GAME                 = 'quit_normal_battle_game';

export const EVT_EMIT_NORMAL_BATTLE_NOT_ELIGIBLE_TO_JOIN    = 'normal_battle_not_eligible_to_join';
export const EVT_EMIT_NORMAL_BATTLE_JOINED 	 				= 'response_join_normal_battle_level';
export const EVT_EMIT_NORMAL_BATTLE_BID_PLACED 				= 'response_place_normal_battle_level_bid';
export const EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS 			= 'update_normal_battle_level_player_list';
export const EVT_EMIT_NORMAL_BATTLE_TIMER        			= 'update_normal_battle_level_timer';
export const EVT_EMIT_NORMAL_BATTLE_GAME_STARTED  			= 'normal_battle_level_game_started';
export const EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID 			= 'hide_normal_battle_level_place_bid_button';
export const EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID 			= 'show_normal_battle_level_place_bid_button';
export const EVT_EMIT_NORMAL_BATTLE_GAME_FINISHED  			= 'normal_battle_level_game_finished';
export const EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START 	= 'normal_battle_game_about_to_start';
export const EVT_EMIT_NORMAL_BATTLE_UPDATE_JACKPOT_AMOUNT 	= 'update_normal_battle_jackpot_amount';
export const EVT_EMIT_NORMAL_BATTLE_JACKPOT_FINISHED 		= 'normal_battle_main_jackpot_finished';
export const EVT_EMIT_NORMAL_BATTLE_SHOW_QUIT_BUTTON        = 'show_normal_battle_quit_button';
export const EVT_EMIT_NORMAL_BATTLE_HIDE_QUIT_BUTTON        = 'hide_normal_battle_quit_button';
export const EVT_EMIT_NORMAL_BATTLE_GAME_QUITTED            = 'normal_battle_game_quitted';



// Jackpot Advance Battle Specific Constants
export const EVT_ON_ADVANCE_BATTLE_JOIN_GAME                 = 'request_join_advance_battle_level';
export const EVT_ON_ADVANCE_BATTLE_PLACE_BID                 = 'request_place_advance_battle_level_bid';
export const EVT_ON_ADVANCE_BATTLE_QUIT_GAME                 = 'quit_advance_battle_game';

export const EVT_EMIT_ADVANCE_BATTLE_NOT_ELIGIBLE_TO_JOIN    = 'advance_battle_not_eligible_to_join';
export const EVT_EMIT_ADVANCE_BATTLE_JOINED                  = 'response_join_advance_battle_level';
export const EVT_EMIT_ADVANCE_BATTLE_BID_PLACED              = 'response_place_advance_battle_level_bid';
export const EVT_EMIT_ADVANCE_BATTLE_UPDATE_PLAYERS          = 'update_advance_battle_level_player_list';
export const EVT_EMIT_ADVANCE_BATTLE_TIMER                   = 'update_advance_battle_level_timer';
export const EVT_EMIT_ADVANCE_BATTLE_GAME_STARTED            = 'advance_battle_level_game_started';
export const EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID          = 'hide_advance_battle_level_place_bid_button';
export const EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID          = 'show_advance_battle_level_place_bid_button';
export const EVT_EMIT_ADVANCE_BATTLE_GAME_FINISHED           = 'advance_battle_level_game_finished';
export const EVT_EMIT_ADVANCE_BATTLE_GAME_ABOUT_TO_START     = 'advance_battle_game_about_to_start';
export const EVT_EMIT_ADVANCE_BATTLE_UPDATE_JACKPOT_AMOUNT   = 'update_advance_battle_jackpot_amount';
export const EVT_EMIT_ADVANCE_BATTLE_JACKPOT_FINISHED        = 'advance_battle_main_jackpot_finished';
export const EVT_EMIT_ADVANCE_BATTLE_SHOW_QUIT_BUTTON        = 'show_advance_battle_quit_button';
export const EVT_EMIT_ADVANCE_BATTLE_HIDE_QUIT_BUTTON        = 'hide_advance_battle_quit_button';
export const EVT_EMIT_ADVANCE_BATTLE_GAME_QUITTED            = 'advance_battle_game_quitted';


// Money Battle Specific Constants
