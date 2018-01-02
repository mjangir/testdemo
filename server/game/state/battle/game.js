import Game from '../common/game';
import JackpotUser from '../jackpot/jackpot-user';
import { convertAmountToCommaString, getUserObjectById } from '../../../utils/functions';
import updateBattleScreen from '../../utils/emitter/update-battle-screen';
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

  EVT_EMIT_UPDATE_BATTLE_GAME_SCREEN
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
BattleGame.prototype.onUserAdded = function() {
  // on user added
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
		remainingBids 	= availableBids - placedBids;

		players.push({
			id            : user.userId,
			userId 			  : user.userId,
			name 			    : userObj.name,
			picture 		  : user.photo,
			totalBids 		: placedBids,
			remainingBids : remainingBids
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
          context.gameStatus = 'STARTED';
          clearInterval(interval);
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
  if(this.getClock('game').remaining > 0 && this.gameStatus == 'STARTED') {
    this.countDown();
    updateBattleScreen(this, BATTLE_SCREEN_SCENE_GAME, [
      BATTLE_SCREEN_COMPONENT_JACKPOT_TIMER, 
      BATTLE_SCREEN_COMPONENT_BATTLE_HEADER,
      BATTLE_SCREEN_COMPONENT_BIDS,
      BATTLE_SCREEN_COMPONENT_FOOTER
    ]);
  }
}

/**
 * Place Bid By User ID
 * 
 * @param {String} userId 
 */
BattleGame.prototype.placeBid = function(userId, socket) {
  var user = this.jackpotGame.getUserById(userId);

  if(user && this.isUserBidConsecutive(user)) {
    showErrorPopup(user.socket, CONSECUTIVE_BIDS_ERROR);
    return false;
  }

  return this.bidContainer.placeBid(userId, socket, function(bidContainer, parent, socket, bid) {
    if(user) {
      user.afterPlacedBid(bidContainer, parent, socket, bid);
      this.getClock('game').increaseBy(this.parent.increaseSecondsOnBid);
      updateBattleScreen(this, BATTLE_SCREEN_SCENE_GAME, [
        BATTLE_SCREEN_COMPONENT_MY_INFO
      ]);
    }
  }.bind(this));
}

export default BattleGame;