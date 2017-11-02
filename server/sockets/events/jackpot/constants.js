'use strict';

export const EVT_ON_CLIENT_CONNECTION   	= 'connection';
export const EVT_ON_CLIENT_DISCONNECT   	= 'disconnect';
export const EVT_ON_CLIENT_BID_PLACED   	= 'place_bid';
export const EVT_ON_CLIENT_QUITTED_GAME 	= 'quit_jackpot_game';

export const EVT_EMIT_ME_JOINED             = 'me_joined';
export const EVT_EMIT_MY_BID_PLACED         = 'my_bid_placed';
export const EVT_EMIT_ME_JOINED_ERR         = 'me_join_error';
export const EVT_EMIT_UPDATE_JACKPOT_DATA   = 'updated_jackpot_data';
export const EVT_EMIT_UPDATE_JACKPOT_AMOUNT = 'update_jackpot_amount';
export const EVT_EMIT_UPDATE_JACKPOT_TIMER  = 'update_jackpot_timer';
export const EVT_EMIT_CAN_I_PLACE_BID       = 'can_i_bid';
export const EVT_EMIT_SHOW_QUIT_BUTTON      = 'show_quit_button';
export const EVT_EMIT_GAME_FINISHED         = 'game_finished';
export const EVT_EMIT_NO_JACKPOT_TO_PLAY    = 'no_jackpot_to_play';
export const EVT_EMIT_GAME_QUITTED    		= 'game_quitted';