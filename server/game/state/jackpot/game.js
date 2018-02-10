import Game from '../common/game';
import JackpotUser from './jackpot-user';
import _ from 'lodash';
import { convertAmountToCommaString, getUserObjectById } from '../../../utils/functions';
import updateHomeScreen from '../../utils/emitter/update-home-screen';
import showErrorPopup from '../../utils/emitter/show-error-popup';
import updateAppHeader from '../../utils/emitter/update-app-header';
import updateLevelScreen from '../../utils/emitter/update-level-screen';
import sqldb from '../../../sqldb';
import moment from 'moment';

import {
  HOME_SCREEN_SCENE_GAME,
  HOME_SCREEN_SCENE_WINNER,

  HOME_SCREEN_COMPONENT_HEADER,
  HOME_SCREEN_COMPONENT_BIDS,
  HOME_SCREEN_COMPONENT_MY_INFO,
  HOME_SCREEN_COMPONENT_FOOTER,

  CONSECUTIVE_BIDS_ERROR
} from '../../constants';

const UserModel                 = sqldb.User;
const JackpotModel              = sqldb.Jackpot;
const JackpotGameModel          = sqldb.JackpotGame;
const JackpotGameUserModel      = sqldb.JackpotGameUser;
const JackpotGameUserBidModel   = sqldb.JackpotGameUserBid;
const JackpotGameWinnerModel    = sqldb.JackpotGameWinner;
const UserWinningMoneyStatement = sqldb.UserWinningMoneyStatement;

/**
 * Jackpot Game
 *
 */
function JackpotGame(parent) {
  Game.call(this);
  this.parent           = parent;
  this.users            = [];
  this.doomsdayExpired  = false;
  this.setTimeclocks();
}

JackpotGame.prototype = Object.create(Game.prototype);

/**
 * Set Time Clocks
 *
 * @returns {*}
 */
JackpotGame.prototype.setTimeclocks = function() {
  var jackpot = this.parent;

  this.setClock('game', jackpot.gameDuration);
  this.setClock('doomsday', jackpot.doomsdayDuration);

  if(jackpot.secondsToIncreaseAmount && jackpot.increaseAmount) {
      this.getClock('game').runEveryXSecond(jackpot.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
  }
}

/**
 * Update Jackpot Amount
 *
 * @returns {*}
 */
JackpotGame.prototype.updateJackpotAmount = function() {
  var jackpot = this.parent;

  jackpot.amount = Number(parseFloat(jackpot.amount, 10) + parseFloat(jackpot.increaseAmount, 10)).toFixed(2);
}

/**
 * Is Dooms Day Clock Over
 *
 * @returns {Boolean}
 */
JackpotGame.prototype.isDoomsDayOver = function()
{
  return this.getClock('doomsday').remaining == 0;
}

/**
 * Is Game Clock Over
 *
 * @returns {Boolean}
 */
JackpotGame.prototype.isGameClockOver = function()
{
  return this.getClock('game').remaining == 0;
}

/**
 * Get All Users
 *
 * @returns {Array}
 */
JackpotGame.prototype.getAllUsers = function() {
  return this.users;
}

/**
 * Get User By ID
 *
 * @param {JackpotUser} userId
 */
JackpotGame.prototype.getUserById = function(userId) {
  return _.find(this.users, {userId: String(userId)}) || false;
}

/**
 * Add User By ID
 *
 * @param {JackpotUser} userId
 */
JackpotGame.prototype.addUserById = function(userId) {
  var user = new JackpotUser(this, userId);
  this.users.push(user);
  return user;
}

/**
 * Is Bid Button Visible
 *
 * @param {JackpotUser} user
 * @returns {Object}
 */
JackpotGame.prototype.isBidButtonVisible = function(user) {
  var minPlayersRequired  = this.parent.minPlayersRequired,
      totalUsers          = this.getAllUsers().length,
      lastBidUserId       = this.bidContainer.getLastBidUserId(),
      userId              = user.userId;

  return (totalUsers >= minPlayersRequired && lastBidUserId != userId);
}

/**
 * Is Quit Button Visible
 *
 * @returns {Object}
 */
JackpotGame.prototype.isQuitButtonVisible = function() {
  return this.isDoomsDayOver();
}

/**
 * Get Average Bid Bank
 *
 * @returns {Number}
 */
JackpotGame.prototype.getAverageBidBank = function() {
  var remaining = this.getRemainingPlayers(),
      bids      = 0;

  for(var k in remaining) {
    bids += remaining[k].getJackpotAvailableBids();
  }

  return bids != 0 && remaining.length != 0 ? Math.round(bids/remaining.length) : 0;
}

/**
 * Get Remaining Players
 *
 * @returns {Array}
 */
JackpotGame.prototype.getRemainingPlayers = function() {
  var users   = this.getAllUsers(),
      result  = [],
      user;

    for(var i in users) {
      user = users[i];
      if(user.gameStatus != 'QUITTED' || user.gameStatus != 'ELIMINATED') {
        result.push(user);
      }
    }

    return result;
}

/**
 * Get Active Players
 *
 * @returns {Array}
 */
JackpotGame.prototype.getActivePlayers = function() {
  var remaining = this.getRemainingPlayers(),
      result    = [];

  for(var k in remaining) {
    if(remaining[k].isActive) {
      result.push(remaining[k]);
    }
  }

  return result;
}

/**
 * Get Game Header Info
 *
 * @returns {Object}
 */
JackpotGame.prototype.getGameHeaderInfo = function() {
  return {
    uniqueId      : this.parent.uniqueId,
    name          : this.parent.title,
    amount        : convertAmountToCommaString(this.parent.amount),
    gameClock     : this.getClock('game').getFormattedRemaining(),
    doomsdayClock : this.getClock('doomsday').getFormattedRemaining()
  };
}

/**
 * Get Bid Info
 *
 * @returns {Object}
 */
JackpotGame.prototype.getBidInfo = function() {
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
JackpotGame.prototype.getPlayersInfo = function() {
  return {
    playersRemaining    : this.getRemainingPlayers().length,
    activePlayers       : this.getActivePlayers().length,
    averageBidBank      : this.getAverageBidBank()
  };
}

/**
 * Get User Info
 *
 * @param {JackpotUser} user
 * @returns {Object}
 */
JackpotGame.prototype.getUserInfo = function(user) {
  return {
    bidBank       : user.getJackpotAvailableBids(),
    myLongestBid  : this.bidContainer.getLongestBidDurationByUserId(user.userId, true),
    battlesWon    : user.getTotalBattleWins(),
    battleStreak  : user.getCurrentBattleStreak()
  }
}

/**
 * Get Home Buttons Info
 *
 * @param {JackpotUser} user
 * @returns {Object}
 */
JackpotGame.prototype.getUserHomeButtonsInfo = function(user) {
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
JackpotGame.prototype.startGame = function()
{
    this.gameStatus = 'STARTED';
    this.startedOn  = new Date();
    this.updateStatusInDB('STARTED');
}

/**
 * Update Status In Database
 *
 * @param {String} status
 * @returns {*}
 */
JackpotGame.prototype.updateStatusInDB = function(status)
{
    this.parent.updateStatusInDB(status);
}

/**
 * Run Every Second
 */
JackpotGame.prototype.runEverySecond = function() {
  if(this.getClock('game').remaining > 0 && this.gameStatus == 'STARTED') {
    this.countDown();

    updateHomeScreen(this, HOME_SCREEN_SCENE_GAME, [
      HOME_SCREEN_COMPONENT_HEADER,
      HOME_SCREEN_COMPONENT_BIDS,
      HOME_SCREEN_COMPONENT_FOOTER
    ]);

    updateAppHeader(this);

    if(this.isDoomsDayOver() && !this.doomsdayExpired) {
      this.doomsdayExpired = true;
      this.updateBattleLevelScreen();
    }
  }

  this.finishGame();
}

/**
 * Update Battle Level Screen
 */
JackpotGame.prototype.updateBattleLevelScreen = function() {

  var users = this.getAllUsers();

  for(var i = 0; i < users.length; i++) {
    updateLevelScreen(this, users[i]);
  }
}

/**
 * Finish Game
 */
JackpotGame.prototype.finishGame = function() {
  if(this.getClock('game').remaining == 0 && this.gameStatus == 'STARTED') {

    var context = this;

    this.gameStatus = 'FINISHED';
    this.updateStatusInDB('FINISHED');

    updateHomeScreen(this, HOME_SCREEN_SCENE_WINNER);

    setTimeout(function()
    {
        var jackpotCore;

        // Create Jackpot Core
        jackpotCore = context.createJackpotCore();

        // Create Jackpot Game Users
        jackpotCore = this.createJackpotCoreUsers(jackpotCore);

        // Create Jackpot Game Winners
        jackpotCore = this.createJackpotCoreWinners(jackpotCore);

        // Save The Data In Database
        this.saveJackpotCoreInDatabase(jackpotCore, function()
        {

        });
    });
  }
}

/**
 * Create Jackpot Core
 *
 * @return {Object}
 */
JackpotGame.prototype.createJackpotCore = function() {
  var winnerData = this.getWinnerData();

  var jackpotCore = {
      jackpotId               : this.parent.id,
      uniqueId                : this.parent.uniqueId,
      totalUsersParticipated  : this.getAllUsers().length,
      totalNumberOfBids       : this.bidContainer.getAllBids().length,
      lastBidDuration         : this.bidContainer.getLastBidDuration(),
      longestBidDuration      : this.bidContainer.getLongestBidDuration(),
      longestBidWinnerUserId  : winnerData.longestBidUser ? winnerData.longestBidUser.id : null,
      lastBidWinnerUserId     : winnerData.lastBidUser ? winnerData.lastBidUser.id : null,
      startedOn               : this.startedOn ? moment(this.startedOn) : moment(new Date()),
      finishedOn              : moment(new Date())
    };

    jackpotCore.startedOn   = jackpotCore.startedOn.format("YYYY-MM-DD HH:mm:ss");
    jackpotCore.finishedOn  = jackpotCore.finishedOn.format("YYYY-MM-DD HH:mm:ss");

  return jackpotCore;
}

/**
 * Create Jackpot Core Users
 *
 * @param  {Object} jackpotCore
 * @return {Object}
 */
JackpotGame.prototype.createJackpotCoreUsers = function(jackpotCore)
{
  jackpotCore.JackpotGameUsers = [];

  var users = this.getAllUsers(),
      user,
      userBids,
      userBid,
      userBidsRefined = [],
      userRelation;

  if(users.length > 0)
  {
    for(var k in users)
    {
      user      = users[k],
      userBids  = this.bidContainer.getAllBids(user.userId);

      if(userBids.length > 0)
      {
        for(var j in userBids)
        {
          userBidsRefined.push({
            bidStartTime: userBids[j].startTime,
            bidEndTime:   userBids[j].endTime,
            bidDuration:  userBids[j].duration
          });
        }
      }

      userRelation = {
        remainingAvailableBids      : user.getJackpotAvailableBids(),
        totalNumberOfBids           : userBids.length,
        longestBidDuration          : this.bidContainer.getLongestBidDurationByUserId(user.userId),
        joinedOn                    : userBids[0] ? userBids[0].startTime : null,
        userId                      : user.userId,
        JackpotGameUserBids         : userBidsRefined,
        normalBattleWins            : user.getTotalNormalBattleWins(),
        gamblingBattleWins          : user.getTotalAdvanceBattleWins(),
        normalBattleLooses          : user.getTotalNormalBattleLooses(),
        gamblingBattleLooses        : user.getTotalAdvanceBattleLooses(),
        normalBattleLongestStreak   : user.getNormalBattleLongestStreak(),
        gamblingBattleLongestStreak : user.getAdvanceBattleLongestStreak()
      };

      jackpotCore.JackpotGameUsers.push(userRelation);
    }
  }

  return jackpotCore;
}

/**
 * Create Jackpot Core Winners
 *
 * @param  {Object} jackpotCore
 * @return {Object}
 */
JackpotGame.prototype.createJackpotCoreWinners = function(jackpotCore)
{
  var winnerData        = this.getWinnerData(),
      jpWinners         = [],
      settings          = global.ticktockGameState.settings,
      lastBidPercent    = parseInt(settings['jackpot_setting_last_bid_percent_amount'], 10),
      longestBidPercent = parseInt(settings['jackpot_setting_longest_bid_percent_amount'], 10);

  if(winnerData.bothAreSame == true)
  {
    jpWinners.push({
        isLastBidUser       : 1,
        isLongestBidUser    : 1,
        jackpotAmount       : this.parent.amount,
        winningAmount       : this.parent.amount,
        userId              : winnerData.lastBidUser.id
    });
  }
  else
  {
    jpWinners.push({
        isLastBidUser       : 1,
        isLongestBidUser    : 0,
        jackpotAmount       : this.parent.amount,
        winningAmount       : parseFloat((this.parent.amount * lastBidPercent/100), 10).toFixed(2),
        userId              : winnerData.lastBidUser.id
    });
    jpWinners.push({
        isLastBidUser       : 0,
        isLongestBidUser    : 1,
        jackpotAmount       : this.parent.amount,
        winningAmount       : parseFloat((this.parent.amount * longestBidPercent/100), 10).toFixed(2),
        userId              : winnerData.longestBidUser.id
    });
  }
  jackpotCore.JackpotGameWinners = jpWinners;

  return jackpotCore;
}

/**
 * Save Jackpot Core Data In Database
 *
 * @param  {Object}   jackpotCore
 * @param  {Function} callback
 * @return {*}
 */
JackpotGame.prototype.saveJackpotCoreInDatabase = function(jackpotCore, callback)
{
  var jpWinners = jackpotCore.JackpotGameWinners;

  return JackpotGameModel.create(jackpotCore,
  {
    include: [
    {
        model   : JackpotGameUserModel,
        as      : 'JackpotGameUsers',
        include : [
        {
            model   : JackpotGameUserBidModel,
            as      : 'JackpotGameUserBids'
        }]
    },
    {
        model   : JackpotGameWinnerModel,
        as      : 'JackpotGameWinners'
    }]
  }).then(function(res)
  {
    // If everything went well, update the jackpot status to finished in main table
    JackpotModel.find({
      where: {
          id: jackpotCore.jackpotId
      }
    })
    .then(function(entity)
    {
      // Update winning money statement
      if(jpWinners.length > 0)
      {
          for(var t in jpWinners)
          {
              UserWinningMoneyStatement.create({
                  userId: jpWinners[t].userId,
                  credit: jpWinners[t].winningAmount,
                  relatedTo: 'JACKPOT'
              });
          }
      }

      entity.updateAttributes({gameStatus: 'FINISHED'})
      .then(function(updated)
      {
          callback.call(global, null);
      }).catch(function(err)
      {
          callback.call(global, err);
      })
    }).catch(function(err){

    });
  }).catch(function(err)
  {
      console.log(err);
      callback.call(global, err);
  });
}

/**
 * Get Winner Data
 */
JackpotGame.prototype.getWinnerData = function() {
  var lastBidDuration  	  = this.bidContainer.getLastBidDuration(),
      lastBidUserId  		  = this.bidContainer.getLastBidUserId(),
      longestBidDuration  = this.bidContainer.getLongestBidDuration(),
      longestBidUserId  	= this.bidContainer.getLongestBidUserId(),
      bothAreSame 		    = lastBidUserId === longestBidUserId,
      lastBidUser 		    = lastBidUserId != null ? getUserObjectById(String(lastBidUserId)) : false,
      longestBidUser 		  = longestBidUserId != null ? getUserObjectById(String(longestBidUserId)) : false;

  return {
    longestBidUser: longestBidUser,
    lastBidUser:    lastBidUser,
    bothAreSame:    bothAreSame
  };
}

/**
 * Place Bid By User ID
 *
 * @param {String} userId
 */
JackpotGame.prototype.placeBid = function(userId, socket) {
  var user = this.getUserById(userId);

  // if(user && this.isUserBidConsecutive(user)) {
  //   showErrorPopup(user.socket, CONSECUTIVE_BIDS_ERROR);
  //   return false;
  // }

  return this.bidContainer.placeBid(userId, socket, function(bidContainer, parent, socket, bid) {
    if(user) {
      user.afterPlacedBid(bidContainer, parent, socket, bid);
      this.getClock('game').increaseBy(this.parent.increaseSecondsOnBid);
      updateHomeScreen(this, HOME_SCREEN_SCENE_GAME, [
        HOME_SCREEN_COMPONENT_MY_INFO
      ], undefined, undefined, undefined, user);
    }
  }.bind(this));
}

/**
 * Get Battle Levels List
 *
 * @returns {JackpotUser}
 * @returns {Array}
 */
JackpotGame.prototype.getBattleLevelList = function(user) {
  var jackpot = this.parent,
      data    = {normal: [], advance: []};

  if(!this.isDoomsDayOver() && Array.isArray(jackpot.getNormalBattleLevels())) {
    var normal = jackpot.getNormalBattleLevels();

    for(var i in normal) {
      data.normal.push({
        uniqueId                : normal[i].uniqueId,
        order                   : normal[i].order,
        levelName               : normal[i].title,
        defaultAvailableBids    : normal[i].defaultAvailableBids,
        isLastLevel             : normal[i].isLastLevel,
        prizeType               : 'BID',
        prizeValue              : normal[i].getPrizeValue(),
        isLocked                : i == 0 ? false : normal[i].isLockedForUser(normal[i-1], user),
        playersCount            : normal[i].getPlayersCount(),
        activePlayersCount      : normal[i].getActivePlayersCount(),
        winsToUnlockNextLevel   : normal[i].getWinsToUnlockNextLevel(user),
        nextLevelName           : jackpot.getNormalBattleLevelByOrder(normal[i].order + 1) ? jackpot.getNormalBattleLevelByOrder(normal[i].order + 1).title : ""
      });
    }
  }

  if(Array.isArray(jackpot.getAdvanceBattleLevels())) {
    var advance = jackpot.getAdvanceBattleLevels();

    for(var k in advance) {
      data.advance.push({
        uniqueId                : advance[k].uniqueId,
        order                   : advance[k].order,
        levelName               : advance[k].title,
        defaultAvailableBids    : advance[k].defaultAvailableBids,
        isLastLevel             : advance[k].isLastLevel,
        prizeType               : 'BID',
        prizeValue              : advance[k].getPrizeValue(),
        isLocked                : false,
        playersCount            : advance[k].getPlayersCount(),
        activePlayersCount      : advance[k].getActivePlayersCount(),
        winsToUnlockNextLevel   : 0,
        minBidsToPut            : advance[k].minBidsToGamb
      });
    }
  }

  return data;
}

export default JackpotGame;
