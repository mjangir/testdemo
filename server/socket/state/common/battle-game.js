'use strict';

import {generateRandomString} from '../../../utils/functions';
import CommonGame from './game';
import JackpotUser from '../jackpot/jackpot-user';
import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import _ from 'lodash';
import {
	EVT_EMIT_NORMAL_BATTLE_GAME_STARTED,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START
} from '../../constants';

function BattleGame(level)
{
	CommonGame.call(this, {gameStatus: 'NOT_STARTED'});

	this.uniqueId 	= generateRandomString(20, 'aA');
	this.level 		= level;
	this.users 		= [];

	this.setTimeclocks();
}

BattleGame.prototype = Object.create(CommonGame.prototype);

BattleGame.prototype.setTimeclocks = function()
{
	this.timeclockContainer.setClocks([{
		clockName 	: 'game',
		duration 	: this.level.duration
	}]);
}

BattleGame.prototype.setInitialPlacedBids = function(user)
{
	if(this.level instanceof NormalBattleLevel)
	{
		this.setBattleLevelPlacedBids(user.placedBids['normalBattle']);
	}
	else if(this.level instanceof AdvanceBattleLevel)
	{
		this.setBattleLevelGameDefaultBids(user.placedBids['advanceBattle']);
	}
}

BattleGame.prototype.setBattleLevelPlacedBids = function(key)
{
	var levelUniqueId 	= this.level.uniqueId,
		gameUniqueId 	= this.uniqueId;

	if(!key.hasOwnProperty(levelUniqueId))
	{
		key[levelUniqueId] = {};
	}

	if(!key[levelUniqueId].hasOwnProperty(gameUniqueId))
	{
		key[levelUniqueId][gameUniqueId] = [];
	}
}

BattleGame.prototype.setDefaultAvailableBids = function(user)
{
	if(this.level instanceof NormalBattleLevel)
	{
		this.setBattleLevelGameDefaultBids(user.availableBids['normalBattle']);
	}
	else if(this.level instanceof AdvanceBattleLevel)
	{
		this.setBattleLevelGameDefaultBids(user.availableBids['advanceBattle']);
	}
}

BattleGame.prototype.setBattleLevelGameDefaultBids = function(key)
{
	var levelUniqueId 	= this.level.uniqueId,
		gameUniqueId 	= this.uniqueId;

	if(!key.hasOwnProperty(levelUniqueId))
	{
		key[levelUniqueId] = {};
	}

	if(!key[levelUniqueId].hasOwnProperty(gameUniqueId))
	{
		key[levelUniqueId][gameUniqueId] = null;
	}

	key[levelUniqueId][gameUniqueId] = this.level.defaultAvailableBids;
}

BattleGame.prototype.getAllUsers = function()
{
	return this.users;
}

BattleGame.prototype.addUser = function(user)
{
	if(!this.hasUser(user))
	{
		this.users.push(user);
		this.setInitialPlacedBids(user);
		this.setDefaultAvailableBids(user);
	}

	return this;
}

BattleGame.prototype.hasUser = function(user)
{
	var user = this.getUser(user);

	return typeof user != 'undefined';
}

BattleGame.prototype.getUser = function(user)
{
	var userId = user instanceof JackpotUser ? user.userId : user;

	return _.find(this.users, {userId: userId});
}

BattleGame.prototype.startGame = function()
{
    var minPlayers = this.level.minPlayersRequired;

    if(!this.isStarted() && this.getAllUsers().length >= minPlayers)
    {
        var socketNs 	= global.ticktockGameState.jackpotSocketNs,
        	room 		= this.getRoomName(),
        	context 	= this,
	        time    	= 10 * 1000,
	        i       	= 1000,
	        countdn 	= time,
	        interval;

	    interval = (function(i, time, context)
	    {
	        return setInterval(function()
	        {
	            if(i > time)
	            {
	                context.gameStatus = 'STARTED';
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_GAME_STARTED, {status: true});
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID, {status: true});
	                clearInterval(interval);
	            }
	            else
	            {
	            	socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID, {status: true});
	                socketNs.in(room).emit(EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START, {time: parseInt(countdn/1000, 10)});
	                countdn -= 1000;
	            }

	            i += 1000;

	        }, i);

	    }(i, time, context));
    }
}

export default BattleGame;