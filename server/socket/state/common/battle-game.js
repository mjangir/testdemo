'use strict';

import {generateRandomString} from '../../../utils/functions';
import CommonGame from './game';
import JackpotUser from '../jackpot/jackpot-user';
import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import _ from 'lodash';

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

BattleGame.prototype.countDown = function()
{
	if(this.isStarted())
	{
		this.timeclockContainer.countDown();
	}
}

export default BattleGame;