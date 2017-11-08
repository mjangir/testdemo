'use strict';

import { generateRandomString, convertAmountToCommaString} from '../../../utils/functions';
import CommonGame from './game';
import JackpotUser from '../jackpot/jackpot-user';
import _ from 'lodash';
import {
	EVT_EMIT_NORMAL_BATTLE_TIMER,
	EVT_EMIT_NORMAL_BATTLE_UPDATE_JACKPOT_AMOUNT,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID
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

BattleGame.prototype.removeUser = function(user)
{
    if(_.remove(this.users, {userId: user.userId}))
    {
        return true;
    }

    return false;
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

BattleGame.prototype.updateJackpotAmount = function()
{
	var ns 		= global.ticktockGameState.jackpotSocketNs,
		amount 	= this.level.jackpot.jackpotAmount,
		amount 	= convertAmountToCommaString(amount),
		evt;

	if(this.constructor.name == 'NormalBattleGame')
	{
		evt = EVT_EMIT_NORMAL_BATTLE_UPDATE_JACKPOT_AMOUNT;
	}

	ns.in(this.getRoomName()).emit(evt, {amount: amount});
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

	if(this.constructor.name == 'NormalBattleGame')
	{
		evt = EVT_EMIT_NORMAL_BATTLE_TIMER;
	}

    ns.in(room).emit(evt, {
        battleClock         : this.getClock('game').getFormattedRemaining(),
        currentBidDuration  : this.bidContainer.getLastBidDuration(true),
        currentBidUserName  : this.bidContainer.getLastBidUserName(),
        longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
        longestBidUserName  : this.bidContainer.getLongestBidUserName()
    });
}

BattleGame.prototype.placeBid = function(userId, socket)
{
    return this.bidContainer.placeBid(userId, socket, this.afterUserPlacedBid.bind(this));
}

BattleGame.prototype.afterUserPlacedBid = function(bidContainer, parent, socket, bid)
{
    var jackpot = parent.level.jackpot,
		user 	= jackpot.getUserById(bid.userId);

    if(user instanceof JackpotUser)
    {
        user.afterPlacedBid(bidContainer, parent, socket, bid);
        this.increaseClockOnNewBid(level);
    }
}

BattleGame.prototype.increaseClockOnNewBid = function(level)
{
	var secondKey 	= 'incrementSecondsOnBid',
		seconds 	= level.hasOwnProperty(secondKey) && level[secondKey] != "" ? parseInt(level[secondKey], 10) : 10;

	this.getClock('game').increaseBy(seconds);
}

export default BattleGame;