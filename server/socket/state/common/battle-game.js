'use strict';

import {generateRandomString} from '../../../utils/functions';
import CommonGame from './game';
import JackpotUser from '../jackpot/jackpot-user';
import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import NormalBattleLGame from '../normal-battle/normal-battle-game';
import _ from 'lodash';
import {
	EVT_EMIT_NORMAL_BATTLE_TIMER
} from '../../constants';

function BattleGame(level)
{
	CommonGame.call(this, {gameStatus: 'NOT_STARTED'});
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

BattleGame.prototype.getAllUsers = function()
{
	return this.users;
}

BattleGame.prototype.addUser = function(user)
{
	if(!this.hasUser(user))
	{
		this.users.push(user);
		user.setDefaultBattlePlacedBids(this);
		user.setDefaultBattleAvailableBids(this);
	}

	return user;
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

BattleGame.prototype.finishGame = function()
{
	// TO DO
}

BattleGame.prototype.emitTimerUpdates = function()
{
	var room 	= this.getRoomName(),
		ns 		= global.ticktockGameState.jackpotSocketNs,
		evt;

	if(this instanceof NormalBattleLGame)
	{
		evt = EVT_EMIT_NORMAL_BATTLE_TIMER;
	}

    ns.in(room).emit(evt, {
        battleClock         : this.getClock('game').getFormattedRemaining(),
        currentBidDuration  : this.bidContainer.getLastBidDuration(),
        currentBidUserName  : this.bidContainer.getLastBidUserName(),
        longestBidDuration  : this.bidContainer.getLongestBidDuration(),
        longestBidUserName  : this.bidContainer.getLongestBidUserName()
    });
}

export default BattleGame;