'use strict';

import {
	generateRandomString,
	convertAmountToCommaString,
	getUserObjectById
} from '../../../utils/functions';
import CommonGame from './game';
import JackpotUser from '../jackpot/jackpot-user';
import _ from 'lodash';
import {
	EVT_EMIT_NORMAL_BATTLE_TIMER,
	EVT_EMIT_NORMAL_BATTLE_UPDATE_JACKPOT_AMOUNT,
	EVT_EMIT_NORMAL_BATTLE_GAME_STARTED,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_QUIT_BUTTON,
	EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START,
	EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS,

	EVT_EMIT_ADVANCE_BATTLE_TIMER,
	EVT_EMIT_ADVANCE_BATTLE_UPDATE_JACKPOT_AMOUNT,
	EVT_EMIT_ADVANCE_BATTLE_GAME_STARTED,
	EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID,
	EVT_EMIT_ADVANCE_BATTLE_HIDE_QUIT_BUTTON,
	EVT_EMIT_ADVANCE_BATTLE_GAME_ABOUT_TO_START,
  EVT_EMIT_ADVANCE_BATTLE_UPDATE_PLAYERS,
  
  EVT_EMIT_NORMAL_BATTLE_GAME_FINISHED
} from '../../constants';

/**
 * Constructor
 *
 * @param {BattleLevel} level
 * @return {*}
 */
function BattleGame(level)
{
	CommonGame.call(this, {gameStatus: 'NOT_STARTED'});

	this.level 		= level;
	this.users 		= [];

	this.setTimeclocks();
}


/**
 * Override Prototype
 *
 * @type {Object}
 */
BattleGame.prototype = Object.create(CommonGame.prototype);


/**
 * Start Battle Level Game
 *
 * @return {*}
 */
BattleGame.prototype.startGame = function()
{
	var minPlayers = this.level.minPlayersRequired,
		evtGameStarted,
		evtShowPlaceBid,
		evtHidePlaceBid,
		evtHideQuitBtn,
		evtGameAboutToStart;

	if(this.constructor.name == 'NormalBattleGame')
	{
		evtGameStarted 		= EVT_EMIT_NORMAL_BATTLE_GAME_STARTED;
		evtShowPlaceBid 	= EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID;
		evtHidePlaceBid 	= EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID;
		evtHideQuitBtn 		= EVT_EMIT_NORMAL_BATTLE_HIDE_QUIT_BUTTON;
		evtGameAboutToStart = EVT_EMIT_NORMAL_BATTLE_GAME_ABOUT_TO_START;
	}
	else if(this.constructor.name == 'AdvanceBattleGame')
	{
		evtGameStarted 		= EVT_EMIT_ADVANCE_BATTLE_GAME_STARTED;
		evtShowPlaceBid 	= EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID;
		evtHidePlaceBid 	= EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID;
		evtHideQuitBtn 		= EVT_EMIT_ADVANCE_BATTLE_HIDE_QUIT_BUTTON;
		evtGameAboutToStart = EVT_EMIT_ADVANCE_BATTLE_GAME_ABOUT_TO_START;
	}

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
	                socketNs.in(room).emit(evtGameStarted, {status: true});
	                socketNs.in(room).emit(evtShowPlaceBid, {status: true});
	                socketNs.in(room).emit(evtHideQuitBtn, {status: true});
	                clearInterval(interval);
	            }
	            else
	            {
	            	socketNs.in(room).emit(evtHidePlaceBid, {status: true});
	                socketNs.in(room).emit(evtGameAboutToStart, {time: parseInt(countdn/1000, 10)});
	                countdn -= 1000;
	            }

	            i += 1000;

	        }, i);

	    }(i, time, context));
    }
}


/**
 * Set Time Clocks For The Game
 *
 * @return {*}
 */
BattleGame.prototype.setTimeclocks = function()
{
	this.timeclockContainer.setClocks([{
		clockName 	: 'game',
		duration 	: this.level.duration
	}]);
}


/**
 * Get All Users Of The Game
 *
 * @return {*}
 */
BattleGame.prototype.getAllUsers = function()
{
	return this.users;
}


/**
 * Add User To Battle Game
 *
 * @param {JackpotUser} user
 * @return {*}
 */
BattleGame.prototype.addUser = function(user)
{
	if(!this.hasUser(user))
	{
		this.users.push(user);
		user.setDefaultBattlePlacedBids(this);
    user.setDefaultBattleAvailableBids(this);
    this.onUserAdded(user);
	}

	return user;
}


/**
 * Remove User From Game
 *
 * @param  {JackpotUser} user
 * @return {*}
 */
BattleGame.prototype.removeUser = function(user)
{
    if(_.remove(this.users, {userId: user.userId}))
    {
        return true;
    }

    return false;
}


/**
 * Check If Game Has Certain User
 *
 * @param  {JackpotUser}  user
 * @return {Boolean}
 */
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
	else if(this.constructor.name == 'AdvanceBattleGame')
	{
		evt = EVT_EMIT_ADVANCE_BATTLE_UPDATE_JACKPOT_AMOUNT;
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

BattleGame.prototype.finishGame = function(forceFinish)
{
	if((this.getClock('game').remaining <= 0 || forceFinish == true) && this.gameStatus != 'FINISHED')
	{
    // Set The Game Status FINISHED
    this.gameStatus = 'FINISHED';
    
		var lastBidDuration  	= this.bidContainer.getLastBidDuration(),
        lastBidUserId  		= this.bidContainer.getLastBidUserId(),
        longestBidDuration  = this.bidContainer.getLongestBidDuration(),
        longestBidUserId  	= this.bidContainer.getLongestBidUserId(),
        bothAreSame 		= lastBidUserId === longestBidUserId,
        lastBidUser 		= lastBidUserId != null ? this.getUser(String(lastBidUserId)) : null,
        longestBidUser 		= longestBidUserId != null ? this.getUser(String(longestBidUserId)) : null,
        excluedUserIds 		= [],
        winners,
        winnerIds,
        finalData = {status: true};

    if(lastBidUser instanceof JackpotUser && longestBidUser instanceof JackpotUser)
    {
      winners   = bothAreSame ? [lastBidUser] : [lastBidUser, longestBidUser];
      winnerIds = bothAreSame ? [String(lastBidUserId)] : [String(lastBidUserId), String(longestBidUserId)];
      this.updateUserInstanceOnFinish(winners, winnerIds);
    }
    else if(lastBidUser instanceof JackpotUser && !(longestBidUser instanceof JackpotUser))
    {
      this.updateUserInstanceOnFinish([lastBidUser], [String(lastBidUserId)]);
    }
    else if(longestBidUser instanceof JackpotUser && !(lastBidUser instanceof JackpotUser))
    {
      this.updateUserInstanceOnFinish([longestBidUser], [String(longestBidUserId)]);
    }
    else
    {

    }

    global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(
      EVT_EMIT_NORMAL_BATTLE_GAME_FINISHED,
      this.buildFinalFinishData(lastBidUser, longestBidUser, bothAreSame, forceFinish)
    );
  }

}

BattleGame.prototype.buildFinalFinishData = function(lastBidUser, longestBidUser, bothAreSame, forceFinish)
{
  var finalData = {status: true};
  
  // For last bid user
  if(lastBidUser instanceof JackpotUser)
  {
    var lastBidUserInfo = getUserObjectById(lastBidUser.userId);

    finalData.lastBidWinner = {
      id:           lastBidUserInfo.id,
      name:         lastBidUserInfo.name,
      availableBids:lastBidUser.getJackpotAvailableBids()
    }
  }
  else
  {
    finalData.lastBidWinner = null
  }

  // For longest bid user
  if(longestBidUser instanceof JackpotUser)
  {
    var longestBidUserInfo = getUserObjectById(longestBidUser.userId);

    finalData.longestBidWinner = {
      id:           longestBidUserInfo.id,
      name:         longestBidUserInfo.name,
      availableBids:longestBidUser.getJackpotAvailableBids()
    }
  }
  else
  {
    finalData.longestBidWinner = null
  }

  finalData.bothAreSame = bothAreSame;

  finalData.forceFinish = forceFinish == true;

  return finalData;
}

BattleGame.prototype.updateUserInstanceOnFinish = function(winners, winnerIds)
{
	var lastWinnerPrize 	= this.level.getLastBidWinnerPrize(),
	    longestWinnerPrize 	= this.level.getLongestBidWinnerPrize(),
	    singleWinnerPrize 	= this.level.getSingleWinnerPrize(),
      users 				= this.getAllUsers();

	if(winners.length > 0)
	{
		if(winners.length == 1)
		{
			winners[0].afterBattleGameFinished(this, this.level, 'WINNER', singleWinnerPrize);
		}
		else if(winners.length == 2)
		{
			winners[0].afterBattleGameFinished(this, this.level, 'WINNER', lastWinnerPrize);
			winners[1].afterBattleGameFinished(this, this.level, 'WINNER', longestWinnerPrize);
		}

		for(var k in users)
	    {
	        if(winnerIds.indexOf(users[k].userId) <= -1)
	        {
	        	users[k].afterBattleGameFinished(this, this.level, 'LOOSER');
	        }
	    }
	}
}

BattleGame.prototype.emitTimerUpdates = function()
{
  if(this.gameStatus == 'STARTED')
  {
    var room 	= this.getRoomName(),
        ns 		= global.ticktockGameState.jackpotSocketNs,
        evt;

      if(this.constructor.name == 'NormalBattleGame')
      {
        evt = EVT_EMIT_NORMAL_BATTLE_TIMER;
      }
      else if(this.constructor.name == 'AdvanceBattleGame')
      {
        evt = EVT_EMIT_ADVANCE_BATTLE_TIMER;
      }

      ns.in(room).emit(evt, {
          battleClock         : this.getClock('game').getFormattedRemaining(),
          currentBidDuration  : this.bidContainer.getLastBidDuration(true),
          currentBidUserName  : this.bidContainer.getLastBidUserName(),
          longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
          longestBidUserName  : this.bidContainer.getLongestBidUserName()
      });
  }
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
        this.increaseClockOnNewBid(parent.level);
    }
}

BattleGame.prototype.increaseClockOnNewBid = function(level)
{
	var secondKey 	= 'incrementSecondsOnBid',
		seconds 	= level.hasOwnProperty(secondKey) && level[secondKey] != "" ? parseInt(level[secondKey], 10) : 10;

	this.getClock('game').increaseBy(seconds);
}

BattleGame.prototype.getAllPlayersList = function()
{
	var users 	= this.getAllUsers(),
		players = [],
		user,
		userObj,
		name,
		placedBids,
		availableBids,
		remainingBids;

	for(var k in users)
	{
		user 			= users[k];
		userObj 		= getUserObjectById(user.userId);

		if(this.constructor.name == 'NormalBattleGame')
		{
			placedBids 		= user.getNormalBattlePlacedBids(this.level, this).length;
			availableBids 	= user.getNormalBattleAvailableBids(this.level, this);
		}
		else if(this.constructor.name == 'AdvanceBattleGame')
		{
			placedBids 		= user.getAdvanceBattlePlacedBids(this.level, this).length;
			availableBids 	= user.getAdvanceBattleAvailableBids(this.level, this);
		}

		remainingBids 	= availableBids - placedBids;

		players.push({
			id 				: user.userId,
			userId 			: user.userId,
			name 			: userObj.name,
			picture 		: user.photo,
			totalBids 		: placedBids,
			remainingBids 	: remainingBids
		});
	}

	return players;
}

BattleGame.prototype.emitUpdatesToItsRoom = function(socket)
{
	var room 	= this.getRoomName(),
		players = this.getAllPlayersList(),
		sendTo 	= typeof socket != 'undefined' ? socket.broadcast : global.ticktockGameState.jackpotSocketNs,
		event;

	if(this.constructor.name == 'NormalBattleGame')
	{
		event = EVT_EMIT_NORMAL_BATTLE_UPDATE_PLAYERS;
	}
	else if(this.constructor.name == 'AdvanceBattleGame')
	{
		event = EVT_EMIT_ADVANCE_BATTLE_UPDATE_PLAYERS;
	}

	sendTo.in(room).emit(event, {players: players});
}

export default BattleGame;
