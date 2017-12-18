'use strict';

import NormalBattleLevel from '../normal-battle/normal-battle-level';
import AdvanceBattleLevel from '../advance-battle/advance-battle-level';
import TimeclockContainer from '../common/timeclock-container';
import JackpotUser from './jackpot-user';
import BidContainer from '../common/bid-container';
import Game from '../common/game';
import sqldb from '../../../sqldb';
import _ from 'lodash';
import moment from 'moment';
import { getUserObjectById, convertAmountToCommaString } from '../../../utils/functions';
import {
    EVT_EMIT_JACKPOT_UPDATE_AMOUNT,
    EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON,
    EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM,
    EVT_EMIT_JACKPOT_UPDATE_TIMER,
    EVT_EMIT_JACKPOT_CAN_I_BID,
    EVT_EMIT_JACKPOT_GAME_FINISHED,
    EVT_EMIT_JACKPOT_DOOMSDAY_OVER
} from '../../constants';

const UserModel                 = sqldb.User;
const JackpotModel              = sqldb.Jackpot;
const JackpotGameModel          = sqldb.JackpotGame;
const JackpotGameUserModel      = sqldb.JackpotGameUser;
const JackpotGameUserBidModel   = sqldb.JackpotGameUserBid;
const JackpotGameWinnerModel    = sqldb.JackpotGameWinner;
const UserWinningMoneyStatement = sqldb.UserWinningMoneyStatement;

function Jackpot(data)
{
    Game.call(this, data);

    this.id                         = data.id,
    this.title                      = data.title;
    this.jackpotAmount              = data.amount;
    this.minPlayersRequired         = data.minPlayersRequired;
    this.gameClockDuration          = data.gameClockTime;
    this.doomsdayClockDuration      = data.doomsDayTime;
    this.gameClockRemaining         = data.gameClockTime;
    this.doomsdayClockRemaining     = data.doomsDayTime;
    this.secondsToIncreaseAmount    = data.increaseAmountSeconds;
    this.increaseAmount             = data.increaseAmount;
    this.gameStatus                 = data.gameStatus;
    this.uniqueId                   = data.uniqueId;
    this.isActive                   = data.status == 'ACTIVE' ? true : false;
    this.startedOn                  = null;
    this.roomPrefix                 = 'JACKPOT_SOCKET_ROOM';

    this.users                      = [];
    this.normalBattleLevels         = [];
    this.advanceBattleLevels        = [];

    // Add Battle Levels
    this.addBattleLevels(data);
    this.setTimeclocks(data);
}

Jackpot.prototype = Object.create(Game.prototype);

Jackpot.prototype.isDoomsDayOver = function()
{
    return this.getClock('doomsday').remaining == 0;
}

Jackpot.prototype.placeBid = function(userId, socket)
{
    return this.bidContainer.placeBid(userId, socket, this.afterUserPlacedBid.bind(this));
}

Jackpot.prototype.afterUserPlacedBid = function(bidContainer, parent, socket, bid)
{
    var user = this.getUserById(bid.userId);

    if(user instanceof JackpotUser)
    {
        user.afterPlacedBid(bidContainer, parent, socket, bid);
        parent.increaseClockOnNewBid();
    }
}

Jackpot.prototype.increaseClockOnNewBid = function()
{
    var key         = 'jackpot_setting_game_clock_seconds_increment_on_bid',
        settings    = global.ticktockGameState.settings,
        seconds     = settings.hasOwnProperty(key) && settings[key] != "" ? parseInt(settings[key], 10) : 10;

    this.getClock('game').increaseBy(seconds);
}

Jackpot.prototype.startGame = function()
{
    this.gameStatus = 'STARTED';
    this.startedOn  = new Date();
    this.updateStatusInDB('STARTED');
}

Jackpot.prototype.updateStatusInDB = function(status)
{
    return JackpotModel.find({where: { id: this.id } })
    .then(function(jackpot)
    {
        return jackpot.updateAttributes({gameStatus: status});
    });
}

Jackpot.prototype.setTimeclocks = function(data)
{
    // Set the clocks
    this.timeclockContainer.setClocks([
    {
        clockName   : 'game',
        duration    : data.gameClockTime
    },
    {
        clockName   : 'doomsday',
        duration    : data.doomsDayTime
    }]);

    // Set update jackpot amoutn callback
    if(this.secondsToIncreaseAmount && this.increaseAmount)
    {
        this.getClock('game').runEveryXSecond(this.secondsToIncreaseAmount, this.updateJackpotAmount.bind(this));
    }
}

Jackpot.prototype.updateJackpotAmount = function(elapsed)
{
    this.jackpotAmount = Number(parseFloat(this.jackpotAmount, 10) + parseFloat(this.increaseAmount, 10)).toFixed(2);
    this.sendUpdatedAmountToJackpotSockets();
    this.sendUpdatedAmountToBattleSockets();
}

Jackpot.prototype.sendUpdatedAmountToJackpotSockets = function()
{
    var amount = convertAmountToCommaString(this.jackpotAmount);

    global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_UPDATE_AMOUNT, {amount: amount});
}

Jackpot.prototype.sendUpdatedAmountToBattleSockets = function()
{
    if(this.normalBattleLevels.length > 0)
    {
        for(var i in this.normalBattleLevels)
        {
            this.normalBattleLevels[i].updateJackpotAmount();
        }
    }

    if(this.advanceBattleLevels.length > 0)
    {
        for(var k in this.advanceBattleLevels)
        {
            this.advanceBattleLevels[k].updateJackpotAmount();
        }
    }
}

Jackpot.prototype.getUsers = function()
{
    return this.users;
}

Jackpot.prototype.getActiveUsers = function()
{
    return _.filter(this.users, function(o)
    {
        return o.isActive == true;
    });
}

Jackpot.prototype.getInActiveUsers = function()
{
    return _.filter(this.users, function(o)
    {
        return o.isActive == false;
    });
}

Jackpot.prototype.getAverageBidBank = function()
{
    var totalAvailableBids = 0;

    for(var k in this.users)
    {
        totalAvailableBids += this.users[k].availableBids['jackpot'];
    }

    return Math.round(totalAvailableBids/this.users.length);
}

Jackpot.prototype.addUserById = function(userId)
{
    var user = new JackpotUser(this, userId);
    this.users.push(user);
    user.setDefaultJackpotAvailableBids();
    return user;
}

Jackpot.prototype.getUserById = function(userId)
{
    if(this.users.length == 0)
    {
        return false;
    }

    for(var k in this.users)
    {
        if(this.users[k].userId == userId)
        {
            return this.users[k];
        }
    }

    return false;
}

Jackpot.prototype.addBattleLevels = function(data)
{
    var levels,
        level;

    if(data.hasOwnProperty('JackpotBattleLevels') && Array.isArray(data.JackpotBattleLevels))
    {
        levels = data.JackpotBattleLevels;

        for(var k in levels)
        {
            if(levels[k].battleType == 'NORMAL')
            {
                this.normalBattleLevels.push(new NormalBattleLevel(this, levels[k]));
            }
            else if(levels[k].battleType == 'GAMBLING')
            {
                this.advanceBattleLevels.push(new AdvanceBattleLevel(this, levels[k]));
            }
        }
    }
}

Jackpot.prototype.getNormalBattleLevelById = function(uniqueId)
{
    return _.find(this.normalBattleLevels, {uniqueId: uniqueId});
}

Jackpot.prototype.getAdvanceBattleLevelById = function(uniqueId)
{
    return _.find(this.advanceBattleLevels, {uniqueId: uniqueId});
}

Jackpot.prototype.getNormalBattleLevelByOrder = function(order)
{
    return _.find(this.normalBattleLevels, {order: order});
}

Jackpot.prototype.getAdvanceBattleLevelByOrder = function(order)
{
    return _.find(this.advanceBattleLevels, {order: order});
}

Jackpot.prototype.getNormalBattleLevels = function()
{
    return _.sortBy(this.normalBattleLevels, 'order');
}

Jackpot.prototype.getAdvanceBattleLevels = function()
{
    return _.sortBy(this.advanceBattleLevels, 'order');
}

Jackpot.prototype.getWinnerData = function()
{
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

Jackpot.prototype.saveDataInDB = function(winnerData)
{
  var jackpotCore;

  // Create Jackpot Core
  jackpotCore = this.createJackpotCore();

  // Create Jackpot Game Users
  jackpotCore = this.createJackpotCoreUsers(jackpotCore);

  // Create Jackpot Game Winners
  jackpotCore = this.createJackpotCoreWinners(jackpotCore);

  // Save The Data In Database
  this.saveJackpotCoreInDatabase(jackpotCore, function()
  {
    
  });
}

Jackpot.prototype.saveJackpotCoreInDatabase = function(jackpotCore, callback)
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

Jackpot.prototype.createJackpotCore = function()
{
  var winnerData = this.getWinnerData();

  var jackpotCore = {
      jackpotId               : this.id,
      uniqueId                : this.uniqueId,
      totalUsersParticipated  : this.getUsers().length,
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

Jackpot.prototype.createJackpotCoreUsers = function(jackpotCore)
{
  jackpotCore.JackpotGameUsers = [];
  
  var users = this.getUsers(),
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

Jackpot.prototype.createJackpotCoreWinners = function(jackpotCore)
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
        jackpotAmount       : this.jackpotAmount,
        winningAmount       : this.jackpotAmount,
        userId              : winnerData.lastBidUser.id
    });
  }
  else
  {
    jpWinners.push({
        isLastBidUser       : 1,
        isLongestBidUser    : 0,
        jackpotAmount       : this.jackpotAmount,
        winningAmount       : parseFloat((this.jackpotAmount * lastBidPercent/100), 10).toFixed(2),
        userId              : winnerData.lastBidUser.id
    });
    jpWinners.push({
        isLastBidUser       : 0,
        isLongestBidUser    : 1,
        jackpotAmount       : this.jackpotAmount,
        winningAmount       : parseFloat((this.jackpotAmount * longestBidPercent/100), 10).toFixed(2),
        userId              : winnerData.longestBidUser.id
    });
  }
  jackpotCore.JackpotGameWinners = jpWinners;

  return jackpotCore;
}

Jackpot.prototype.emitBattlesInfoEverySecond = function()
{
    if(this.normalBattleLevels.length > 0)
    {
        for(var i in this.normalBattleLevels)
        {
            this.normalBattleLevels[i].updateTimerEverySecond();
        }
    }

    if(this.advanceBattleLevels.length > 0)
    {
        for(var k in this.advanceBattleLevels)
        {
            this.advanceBattleLevels[k].updateTimerEverySecond();
        }
    }
}

Jackpot.prototype.emitSomeoneJoined = function()
{
    this.emitUpdatesToItsRoom();
}

Jackpot.prototype.emitSomeoneQutted = function()
{
    this.emitUpdatesToItsRoom();
}

/**
 * Methods That Will Be Called Every Second
 * for JACKPOT
 */

Jackpot.prototype.fireForJackpotOnEverySecond = function()
{
    if(this.isNotStarted() || this.isFinished())
    {
        this.emitTimerUpdates();
        return;
    }

    this.countDown();
    this.emitShowQuitButton();
    this.finishGame();
    this.emitTimerUpdates();
    this.emitUpdatesToItsRoom();
    this.finishNormalBattlesEverySecond();
}

Jackpot.prototype.emitShowQuitButton = function()
{
    var gcRemaining = this.getClockRemaining('game'),
        ddRemaining = this.getClockRemaining('doomsday');

    if(gcRemaining > 0 && ddRemaining <= 0)
    {
        global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_SHOW_QUIT_BUTTON, {
            status: true
        });
        
        global.ticktockGameState.jackpotSocketNs.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_DOOMSDAY_OVER, {
          status: true
        });
    }
}

Jackpot.prototype.finishGame = function()
{
    var context   = this,
        namespace = global.ticktockGameState.jackpotSocketNs,
        winnerData;

    if(context.getClockRemaining('game') == 0)
    {
        this.gameStatus = 'FINISHED';

        winnerData = this.getWinnerData();

        namespace.in(this.getRoomName()).emit(EVT_EMIT_JACKPOT_GAME_FINISHED, winnerData);

        setTimeout(function()
        {
            context.saveDataInDB(winnerData);
        });
    }
}

Jackpot.prototype.emitTimerUpdates = function()
{
    var roomName = this.getRoomName();

    global.ticktockGameState.jackpotSocketNs.in(roomName).emit(EVT_EMIT_JACKPOT_UPDATE_TIMER, {
        gameClockTime       : this.getClock('game').getFormattedRemaining(),
        doomsDayClockTime   : this.getClock('doomsday').getFormattedRemaining(),
        lastBidDuration     : this.bidContainer.getLastBidDuration(true),
        lastBidUserName     : this.bidContainer.getLastBidUserName(),
        longestBidDuration  : this.bidContainer.getLongestBidDuration(true),
        longestBidUserName  : this.bidContainer.getLongestBidUserName()
    });
}

Jackpot.prototype.emitUpdatesToItsRoom = function()
{
    var room = this.getRoomName(),
        data = this.getUpdatedJackpotData();

    global.ticktockGameState.jackpotSocketNs.in(room).emit(EVT_EMIT_JACKPOT_UPDATES_TO_ITS_ROOM, data);
}

Jackpot.prototype.getUpdatedJackpotData = function()
{
    var bidContainer    = this.bidContainer,
        placedBids      = bidContainer.getAllBids();

    return {
        totalUsers      : this.getUsers().length,
        activePlayers   : this.getActiveUsers().length,
        remainingPlayers: this.getInActiveUsers().length,
        longestBid      : null,
        averageBidBank  : this.getAverageBidBank(),
        totalBids       : placedBids.length,
        currentBidUser  : {name: bidContainer.getLastBidUserName()},
        canIBid         : false
    };
}

/**
 * Methods That Will Be Called Every Second For Battles
 */
Jackpot.prototype.fireForBattleOnEverySecond = function()
{
    if(this.normalBattleLevels.length > 0)
    {
        for(var i in this.normalBattleLevels)
        {
            this.normalBattleLevels[i].fireOnEverySecond();
        }
    }

    if(this.advanceBattleLevels.length > 0)
    {
        for(var k in this.advanceBattleLevels)
        {
            this.advanceBattleLevels[k].fireOnEverySecond();
        }
    }
}

Jackpot.prototype.getBasicInfo = function()
{
    return {
        uniqueId:    this.uniqueId,
        name:        this.title,
        amount:      convertAmountToCommaString(this.jackpotAmount)
    };
}

Jackpot.prototype.finishNormalBattlesEverySecond = function()
{
  if(this.getClock('doomsday') <= 10)
  {
    var normalBattleLevels = this.getNormalBattleLevels();

    if(normalBattleLevels.length > 0)
    {
      for(var k in normalBattleLevels)
      {
        normalBattleLevels[k].finishAllGamesForcefully();
      }
    }
  }
}

export default Jackpot;
