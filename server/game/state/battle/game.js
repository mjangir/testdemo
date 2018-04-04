import Game from '../common/game';
import JackpotUser from '../jackpot/jackpot-user';
import { convertAmountToCommaString, getUserObjectById } from '../../../utils/functions';
import updateBattleScreen from '../../utils/emitter/update-battle-screen';
import updateHomeScreen from '../../utils/emitter/update-home-screen';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import {
  BATTLE_SCREEN_SCENE_GAME,
  BATTLE_SCREEN_SCENE_COUNTDOWN,
  BATTLE_SCREEN_SCENE_WINNER,

  BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER,
  BATTLE_SCREEN_COMPONENT_BATTLE_HEADER,
  BATTLE_SCREEN_COMPONENT_BIDS,
  BATTLE_SCREEN_COMPONENT_PLAYERS,
  BATTLE_SCREEN_COMPONENT_MY_INFO,
  BATTLE_SCREEN_COMPONENT_FOOTER,

  CONSECUTIVE_BIDS_ERROR,

  HOME_SCREEN_SCENE_GAME,
  HOME_SCREEN_COMPONENT_MY_INFO,
  HOME_SCREEN_COMPONENT_PLAYERS,
  HOME_SCREEN_COMPONENT_FOOTER
} from '../../constants';
import _ from 'lodash';

/**
 * Battle Game
 * 
 * @param {any} parent 
 */
function BattleGame(parent) {
  Game.call(this);
  this.parent       = parent;
  this.jackpot      = parent.jackpot;
  this.jackpotGame  = this.jackpot.game;
  this.users        = [];
  this.gameStatus   = 'NOT_STARTED';
  this.setTimeclocks();
}

BattleGame.prototype = Object.create(Game.prototype);

/**
 * Set Time Clocks
 * 
 * @returns {*}
 */
BattleGame.prototype.setTimeclocks = function() {
  this.setClock('game', this.parent.gameDuration);
}

/**
 * Is Game Clock Over
 * 
 * @returns {Boolean}
 */
BattleGame.prototype.isGameClockOver = function()
{
  return this.getClock('game').remaining == 0;
}

/**
 * Get Battle Game Header Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getGameHeaderInfo = function() {
  return {
    name      : this.parent.title,
    prize     : this.parent.getPrizeValue(),
    gameClock : this.getClock('game').getFormattedRemaining()
  };
}

/**
 * Get All Users Of The Game
 *
 * @return {*}
 */
BattleGame.prototype.getAllUsers = function() {
	return this.users;
}

/**
 * Get All Active Users
 */
BattleGame.prototype.getActiveUsers = function() {
  return this.users;
}


/**
 * Add User To Battle Game
 *
 * @param {JackpotUser} user
 * @return {*}
 */
BattleGame.prototype.addUser = function(user) {
	if(!this.hasUser(user))
	{
    this.users.push(user);
    user.setBattleDefaultAvailableBids(this.parent, this);
    user.setBattleDefaultPlacedBids(this.parent, this);
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
BattleGame.prototype.removeUser = function(user) {
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
BattleGame.prototype.hasUser = function(user) {
	var user = this.getUser(user);

	return typeof user != 'undefined';
}

/**
 * Get User
 * 
 * @param {JackpotUser} user 
 * @returns {JackpotUser|undefined}
 */
BattleGame.prototype.getUser = function(user) {
	var userId = user instanceof JackpotUser ? user.userId : user;

	return _.find(this.users, {userId: userId});
}

/**
 * On User Added
 */
BattleGame.prototype.onUserAdded = function(user) {
  if(this.parent.battleType == 'ADVANCE') {
    user.decreaseJackpotAvailableBids(parseInt(this.parent.minBidsToGamb, 10));
    updateHomeScreen(this.jackpotGame, HOME_SCREEN_SCENE_GAME, [
      HOME_SCREEN_COMPONENT_MY_INFO,
      HOME_SCREEN_COMPONENT_PLAYERS
    ], null, this.parent, this);
  }
}

/**
 * Get Jackpot Timer
 * 
 * @returns {Object}
 */
BattleGame.prototype.getJackpotTimer = function() {
  return {
    name          : this.jackpot.title,
    amount        : convertAmountToCommaString(this.jackpot.amount),
    gameClock     : this.jackpotGame.getClock('game').getFormattedRemaining(),
    doomsdayClock : this.jackpotGame.getClock('doomsday').getFormattedRemaining()
  };
}

/**
 * Get Battle Header
 * 
 * @returns {Object}
 */
BattleGame.prototype.getBattleHeader = function() {
  return {
    jackpotUniqueId : this.parent.jackpot.uniqueId,
    levelUniqueId   : this.parent.uniqueId,
    gameUniqueId    : this.uniqueId,
    levelName       : this.parent.title,
    prizeValue      : this.parent.getPrizeValue(),
    prizeType       : 'BID',
    gameClock       : this.getClock('game').getFormattedRemaining()
  };
}

/**
 * Get Bids Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getBidInfo = function() {
  return {
    currentBidDuration  : this.bidContainer.getLastBidDuration(true),
    currentBidUser      : this.bidContainer.getLastBidUserName(),
    longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
    longestBidUser      : this.bidContainer.getLongestBidUserName(),
  }
}

/**
 * Get Players Info
 * 
 * @returns {Object}
 */
BattleGame.prototype.getPlayersInfo = function() {
  var users 	= this.getAllUsers(),
      players = [],
      user,
      userObj,
      name,
      placedBids,
      availableBids,
      remainingBids;

	for(var k in users) {
		user 			      = users[k];
		userObj         = getUserObjectById(user.userId);
		placedBids 		  = user.getBattlePlacedBids(this.parent, this).length;
		availableBids 	= user.getBattleAvailableBids(this.parent, this);

		players.push({
			id            : user.userId,
			userId 			  : user.userId,
			name 			    : userObj.name,
			picture 		  : user.photo,
			totalBids 		: placedBids,
			remainingBids : availableBids
		});
	}

	return players;
}

/**
 * Get User Info
 * 
 * @param {JackpotUser} user
 * @returns {Object}
 */
BattleGame.prototype.getUserInfo = function(user) {
  return {
    bidBank : user.getBattleAvailableBids(this.parent, this)
  }
}

/**
 * Is Bid Button Visible
 * 
 * @param {JackpotUser} user 
 * @return {Boolean}
 */
BattleGame.prototype.isBidButtonVisible = function(user) {
  var lastBidUserId   = this.bidContainer.getLastBidUserId(),
      userId          = user.userId;
    
  return lastBidUserId != userId && user.getBattleAvailableBids(this.parent, this) > 0;
}

/**
 * Is Quit Button Visible
 * 
 * @return {Boolean}
 */
BattleGame.prototype.isQuitButtonVisible = function() {
  return this.isNotStarted();
}

/**
 * Get Battle Buttons Info
 * 
 * @param {JackpotUser} user
 * @returns {Object}
 */
BattleGame.prototype.getBattleButtonsInfo = function(user) {
  return {
    showBidButton: this.isBidButtonVisible(user),
    showQuitButton: this.isQuitButtonVisible(),
  };
}

/**
 * Start Game
 * 
 * @returns {*}
 */
BattleGame.prototype.startGame = function() {
  var minPlayers = this.parent.minPlayersRequired;

  if(!this.isStarted() && this.getAllUsers().length >= minPlayers) {
    var socketNs 	= global.ticktockGameState.jackpotSocketNs,
        room 		  = this.getRoomName(),
        context 	= this,
        time    	= 10 * 1000,
        i       	= 1000,
        countdn 	= time,
        interval;

    interval = (function(i, time, context) {
      return setInterval(function() {
        if(i > time) {
          clearInterval(interval);
          updateBattleScreen(context, BATTLE_SCREEN_SCENE_GAME, [
            BATTLE_SCREEN_COMPONENT_MY_INFO,
            BATTLE_SCREEN_COMPONENT_PLAYERS
          ]);
        } else {
          updateBattleScreen(context, BATTLE_SCREEN_SCENE_COUNTDOWN, null, null, {time: parseInt(countdn/1000, 10)});
          countdn -= 1000;
        }

        i += 1000;

      }, i);

    }(i, time, context));
  }
}

/**
 * Run Every Second
 */
BattleGame.prototype.runEverySecond = function() {
  var forceFinish = false;

  console.log(this.gameStatus);

  if(this.getClock('game').remaining > 0 && this.gameStatus == 'STARTED') {
    this.countDown();
    updateBattleScreen(this, BATTLE_SCREEN_SCENE_GAME, [
      BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER, 
      BATTLE_SCREEN_COMPONENT_BATTLE_HEADER,
      BATTLE_SCREEN_COMPONENT_BIDS,
      BATTLE_SCREEN_COMPONENT_FOOTER
    ]);

    if(this.jackpotGame.getClock('game').remaining <= 0 && 
            (this.parent.battleType == 'ADVANCE' || this.parent.battleType == 'NORMAL')) {
      this.finishGame(true);
    } else {
      this.finishGame();
    }
  }
}

/**
 * Place Bid By User ID
 * 
 * @param {String} userId 
 */
BattleGame.prototype.placeBid = function(userId, socket) {
  var user = this.jackpotGame.getUserById(userId);
  var context= this;

  if(user && this.isUserBidConsecutive(user)) {
    showErrorPopup(user.socket, CONSECUTIVE_BIDS_ERROR);
    return false;
  }

  return this.bidContainer.placeBid(userId, socket, function(bidContainer, parent, socket, bid) {

    if(context.gameStatus == 'NOT_STARTED') {
      console.log("first time start the game");
      context.gameStatus = 'STARTED';
    }
    if(user) {
      user.afterPlacedBid(bidContainer, parent, socket, bid);
      this.getClock('game').increaseBy(this.parent.increaseSecondsOnBid);
      updateBattleScreen(this, BATTLE_SCREEN_SCENE_GAME, [
        BATTLE_SCREEN_COMPONENT_MY_INFO,
        BATTLE_SCREEN_COMPONENT_PLAYERS
      ]);
    }
  }.bind(this));
}

/**
 * Finish Game
 * 
 * @param {Boolean} forceFinish 
 */
BattleGame.prototype.finishGame = function(forceFinish)
{
	if((this.getClock('game').remaining <= 0 || forceFinish == true) && this.gameStatus != 'FINISHED')
	{
    // Set The Game Status FINISHED
    this.gameStatus = 'FINISHED';
    
		var lastBidDuration  	  = this.bidContainer.getLastBidDuration(),
        lastBidUserId  		  = this.bidContainer.getLastBidUserId(),
        longestBidDuration  = this.bidContainer.getLongestBidDuration(),
        longestBidUserId  	= this.bidContainer.getLongestBidUserId(),
        bothAreSame 		    = lastBidUserId === longestBidUserId,
        lastBidUser 		    = lastBidUserId != null ? this.getUser(String(lastBidUserId)) : null,
        longestBidUser 		  = longestBidUserId != null ? this.getUser(String(longestBidUserId)) : null,
        excluedUserIds 		  = [],
        winners,
        winnerIds;

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

    updateBattleScreen(this, BATTLE_SCREEN_SCENE_WINNER, null, null, this.buildFinalFinishData(lastBidUser, longestBidUser, bothAreSame, forceFinish));
    updateHomeScreen(this.jackpotGame, HOME_SCREEN_SCENE_GAME, [
      HOME_SCREEN_COMPONENT_MY_INFO,
      HOME_SCREEN_COMPONENT_FOOTER
    ], null, this.parent, this);
  }

}

/**
 * Build Final Data
 * 
 * @param {JackpotUser} lastBidUser 
 * @param {JackpotUser} longestBidUser 
 * @param {Boolean} bothAreSame 
 * @param {Boolean} forceFinish 
 */
BattleGame.prototype.buildFinalFinishData = function(lastBidUser, longestBidUser, bothAreSame, forceFinish)
{
  var finalData = {status: true};
  
  // For last bid user
  if(lastBidUser instanceof JackpotUser)
  {
    var lastBidUserInfo = getUserObjectById(lastBidUser.userId);

    finalData.lastBidWinner = {
      id:   lastBidUserInfo.id,
      name: lastBidUserInfo.name
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
      id:   longestBidUserInfo.id,
      name: longestBidUserInfo.name
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

/**
 * Update User Instance On Finish
 * 
 * @param {Array} winners 
 * @param {Array} winnerIds 
 */
BattleGame.prototype.updateUserInstanceOnFinish = function(winners, winnerIds)
{
	var lastWinnerPrize 	  = this.parent.getLastBidWinnerPrize(),
	    longestWinnerPrize 	= this.parent.getLongestBidWinnerPrize(),
	    singleWinnerPrize 	= this.parent.getSingleWinnerPrize(),
      users 				      = this.getAllUsers();

	if(winners.length > 0)
	{
		if(winners.length == 1)
		{
			winners[0].afterBattleGameFinished(this, this.parent, 'WINNER', singleWinnerPrize);
		}
		else if(winners.length == 2)
		{
			winners[0].afterBattleGameFinished(this, this.parent, 'WINNER', lastWinnerPrize);
			winners[1].afterBattleGameFinished(this, this.parent, 'WINNER', longestWinnerPrize);
		}

		for(var k in users)
    {
      if(winnerIds.indexOf(users[k].userId) <= -1)
      {
        users[k].afterBattleGameFinished(this, this.parent, 'LOOSER');
      }
    }
	}
}

export default BattleGame;
