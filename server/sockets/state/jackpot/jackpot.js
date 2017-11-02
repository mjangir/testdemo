'use strict';

import sqldb from '../../../sqldb';
import User from './user';
import moment from 'moment';
import lodash from 'lodash';
import NormalBattleContainer from '../normal-battle';
import GamblingBattleContainer from '../gambling-battle';
import {convertAmountToCommaString} from '../../../utils/functions';

import {
    EVT_EMIT_UPDATE_JACKPOT_DATA,
    EVT_EMIT_UPDATE_JACKPOT_AMOUNT
} from '../../events/jackpot/constants';

const UserModel                 = sqldb.User;
const JackpotModel              = sqldb.Jackpot;
const JackpotGameModel          = sqldb.JackpotGame;
const JackpotGameUserModel      = sqldb.JackpotGameUser;
const JackpotGameUserBidModel   = sqldb.JackpotGameUserBid;
const JackpotGameWinnerModel    = sqldb.JackpotGameWinner;
const SettingsModel             = sqldb.Settings;
const UserWinningMoneyStatement = sqldb.UserWinningMoneyStatement;

/**
 * Jackpot Constructor
 *
 * @param {Object} data
 */
function Jackpot(data)
{
    data['finishedOn']               = null;
    this.metaData   	             = data;
    this.users      	             = {};
    this.lastBid 		             = null;
    this.lastBidUser  	             = null;
    this.normalBattleContainer       = new NormalBattleContainer(this);
    this.gamblingBattleContainer     = new GamblingBattleContainer(this);
    this.lastSecondWhenAmountChanged = 0;
    this.setRoomName();
}

/**
 * Set socket room name
 *
 */
Jackpot.prototype.setRoomName = function()
{
    var roomPrefix  = 'JACKPOT_ROOM_';
    var uniqueId    = this.metaData.uniqueId;
    var roomName    = roomPrefix + uniqueId;
    this.roomName   = roomName;
}

/**
 * Get Socket room name
 *
 * @return {String}
 */
Jackpot.prototype.getRoomName = function()
{
    return this.roomName;
}

/**
 * Count down the timer
 *
 * @return {*}
 */
Jackpot.prototype.countDown = function()
{
    if(this.metaData.gameClockRemaining  > 0)
    {
        this.metaData.gameClockRemaining -= 1;
    }
    if(this.metaData.doomsDayRemaining  > 0)
    {
        this.metaData.doomsDayRemaining -= 1;
    }
}

/**
 * Get jackpot meta data
 *
 * @return {Object}
 */
Jackpot.prototype.getMetaData = function()
{
    return this.metaData;
}

/**
 * Get Human Readable Game Clock Time
 *
 * @return {String}
 */
Jackpot.prototype.getHumanGameClock = function()
{
    var time = this.convertSecondsToCounterTime(this.metaData.gameClockRemaining);
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}

/**
 * Get Human Readable Doomds Day Clock
 *
 * @return {String}
 */
Jackpot.prototype.getHumanDoomsDayClock = function()
{
	var time = this.convertSecondsToCounterTime(this.metaData.doomsDayRemaining);
    if(time.days > 0)
    {
        return time.days + ":" +time.hours + ":" + time.minutes + ":" + time.seconds;
    }
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}

/**
 * Get Human Readable Last Bid Duration (It will always be
 * in real time)
 *
 * @return {String}
 */
Jackpot.prototype.getHumanLastBidDuration = function()
{
	var time = this.lastBid != null ? this.convertSecondsToCounterTime(this.lastBid.getRealTimeDuration()) : {minutes: '00', seconds: '00'};
	return time.minutes + ":" + time.seconds;
}

/**
 * Check if jackpot has user
 *
 * @param  {Integer}  userId
 * @return {Boolean}
 */
Jackpot.prototype.hasUser = function(userId)
{
    return this.users.hasOwnProperty(userId);
}

/**
 * Get Jackpot User Instance
 *
 * @param  {Integer}  userId
 * @return {JackpotUser}
 */
Jackpot.prototype.getUser = function(userId)
{
    return this.users[userId] ? this.users[userId] : false;
}

/**
 * Check if jackpot is currently being played
 *
 * @return {Boolean}
 */
Jackpot.prototype.isCurrentlyBeingPlayed = function()
{
    return this.metaData.gameStatus == 'STARTED';
}

/**
 * Check if jackpot is in non started mode
 *
 * @return {Boolean}
 */
Jackpot.prototype.isNotStarted = function()
{
	return this.metaData.gameStatus == 'NOT_STARTED';
}

/**
 * Change jackpot game status to "STARTED"
 *
 * @return {Boolean}
 */
Jackpot.prototype.startGame = function()
{
    this.metaData.startedOn     = new Date();
    this.metaData.gameStatus    = 'STARTED';
    this.updateStatusInDb('STARTED');
}

Jackpot.prototype.updateStatusInDb = function(status)
{
    JackpotModel.find({
        where: {
            id: this.metaData.id
        }
    })
    .then(function(entity)
    {
        entity.updateAttributes({gameStatus: status})
        .then(function(updated)
        {

        }).catch(function(err)
        {

        })
    });
}

Jackpot.prototype.updateJackpotAmountOnParticularDuration = function()
{
    if(this.metaData.increaseAmountSeconds && this.metaData.increaseAmount)
    {
        var secondsPassed   = this.metaData.doomsDayTime - this.metaData.doomsDayRemaining,
            sendingAmount;

        if((this.lastSecondWhenAmountChanged + this.metaData.increaseAmountSeconds) == secondsPassed)
        {
            this.lastSecondWhenAmountChanged = secondsPassed;
            this.metaData.amount    = this.metaData.amount + parseInt(this.metaData.increaseAmount, 10);
            sendingAmount           = convertAmountToCommaString(this.metaData.amount);
            this.emitUpdatedAmountToJackpotAndItsBattles(sendingAmount);
            this.updateNewAmountToDb(this.metaData.amount);
        }
    }

    if(this.metaData.durationSetting)
    {
        // try
        // {
        //     var setting         = JSON.parse(this.metaData.durationSetting),
        //         data            = {},
        //         secondsPassed   = this.metaData.doomsDayTime - this.metaData.doomsDayRemaining,
        //         sendingAmount;

        //     if(Array.isArray(setting) && setting.length > 0)
        //     {
        //         for(var k in setting)
        //         {
        //             data[setting[k]['seconds']] = setting[k]['amount'];
        //         }

        //         if(secondsPassed > 0 && Object.keys(data).length > 0 && data.hasOwnProperty(secondsPassed))
        //         {
        //             this.metaData.amount    = data[secondsPassed];
        //             sendingAmount           = convertAmountToCommaString(this.metaData.amount);
        //             this.emitUpdatedAmountToJackpotAndItsBattles(sendingAmount);
        //             this.updateNewAmountToDb(this.metaData.amount);
        //         }
        //     }
        // }
        // catch(error)
        // {

        // }
    }
}

Jackpot.prototype.updateNewAmountToDb = function(amt)
{
    JackpotModel.find({
        where: {
            id: this.metaData.id
        }
    })
    .then(function(entity)
    {
        entity.updateAttributes({amount: amt})
        .then(function(updated)
        {

        }).catch(function(err)
        {

        })
    });
}

Jackpot.prototype.emitUpdatedAmountToJackpotAndItsBattles = function(amount)
{
    global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_UPDATE_JACKPOT_AMOUNT, {amount: amount});
    this.normalBattleContainer.updateNewJackpotAmount(amount);
    this.gamblingBattleContainer.updateNewJackpotAmount(amount);
}

Jackpot.prototype.emitJackpotFinishedToItsBattles = function()
{
    this.normalBattleContainer.emitMainJackpotFinished();
    this.gamblingBattleContainer.emitMainJackpotFinished();
}

/**
 * Finish Jackpot Game
 *
 * @return {*}
 */
Jackpot.prototype.finishGame = function(callback)
{
    var jackpotFullData;

    this.metaData.gameStatus    = 'FINISHED';
    this.metaData.finishedOn    = new Date();

    if(typeof callback == 'function')
    {
        jackpotFullData = this.getJackpotCompleteData();

        callback.call(global, this, jackpotFullData);
    }
    this.emitJackpotFinishedToItsBattles();
}

/**
 * Emit Jackpot newly updated data to every person in that room
 *
 * @return {*}
 */
Jackpot.prototype.emitUpdatesToItsRoom = function()
{
    var roomName = this.getRoomName();

    global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_UPDATE_JACKPOT_DATA, this.getUpdatedJackpotData());
}

/**
 * Get jackpot updated data (Important Method)
 *
 * @return {Object}
 */
Jackpot.prototype.getUpdatedJackpotData = function()
{
	var placedBids 	= this.getAllBids();

	return {
        totalUsers      : Object.keys(this.users).length,
        totalBids       : placedBids.length,
        longestBid      : this.getLongestBid(),
        activePlayers   : this.getActiveUsers().length,
        remainingPlayers: this.getInActiveUsers().length,
        averageBidBank  : this.getAverageBidBank(),
        canIBid         : true,
        currentBidUser  : {
            name: this.lastBidUser != null ? this.lastBidUser.getMetaData().name : ""
        }
    }

	return {};
}

/**
 * Add a new Jackpot user
 *
 * @param {Integer}   userId
 * @param {Function} callback
 */
Jackpot.prototype.addUser = function(userId, callback)
{
	var context = this;

    if(this.users.hasOwnProperty(userId))
    {
    	callback.call(global, null, this.users[userId]);
    }

    UserModel.find({
    	where: {id: userId},
    	raw: true
    })
    .then(function(user)
    {
    	context.users[userId] = new User(user);
    	callback.call(global, null, context.users[userId]);
    })
    .catch(function(err)
    {
    	callback.call(global, err);
    });
}

/**
 * Remove Jackpot User
 *
 * @return {*}
 */
Jackpot.prototype.removeUser = function()
{

}

/**
 * Convert Seconds To Hours, Minutes and Seconds
 *
 * @param  {Integer} seconds
 * @return {Object}
 */
Jackpot.prototype.convertSecondsToCounterTime = function(seconds)
{
    var days                = Math.floor(seconds/24/60/60),
        hoursLeft           = Math.floor((seconds) - (days*86400)),
        hours               = Math.floor(hoursLeft/3600),
        minutesLeft         = Math.floor((hoursLeft) - (hours*3600)),
        minutes             = Math.floor(minutesLeft/60),
        remainingSeconds    = seconds % 60;

    if(hours < 10)
    {
        hours = "0" + hours;
    }

    if(minutes < 10)
    {
        minutes = "0" + minutes;
    }

    if(remainingSeconds < 10)
    {
        remainingSeconds = "0" + remainingSeconds;
    }

    return {
        days: days,
    	hours: hours,
    	minutes: minutes,
    	seconds: remainingSeconds
    };
}

/**
 * Update last bid duration for this jackpot
 *
 * @param  {Bid} newBid
 * @param  {JackpotUser} newBidUser
 * @return {*}
 */
Jackpot.prototype.updateLastBidDuration = function(newBid, newBidUser)
{
	var lastBid = this.lastBid;

	if(lastBid)
	{
		lastBid.updateDuration();
	}

	this.lastBid 		= newBid;
	this.lastBidUser 	= newBidUser;
}

/**
 * Increase Jackpot Game Clock By 10 Seconds
 * TODO - Need to make it dynamic
 *
 * @return {*}
 */
Jackpot.prototype.increaseGameClockOnNewBid = function()
{
    var seconds = 10;

    if(global.globalSettings['jackpot_setting_game_clock_seconds_increment_on_bid'])
    {
        seconds = parseInt(global.globalSettings['jackpot_setting_game_clock_seconds_increment_on_bid'], 10);
    }

	if(this.metaData.gameClockRemaining + seconds >= this.metaData.gameClockTime)
	{
		this.metaData.gameClockRemaining = this.metaData.gameClockTime;
	}
	else
	{
		this.metaData.gameClockRemaining += seconds;
	}
}

/**
 * Get all jackpot users, who are currently viewing the game
 *
 * @return {Array}
 */
Jackpot.prototype.getActiveUsers = function()
{
	var context = this;

	return Object.keys(this.users).filter(function(id)
	{
		return context.users[id].isActive == true && context.users[id].gameStatus != 'QUITTED';
	});
}

/**
 * Get all jackpot users, who are currently not viewing the game
 *
 * @return {Array}
 */
Jackpot.prototype.getInActiveUsers = function()
{
	var context = this;

	return Object.keys(this.users).filter(function(id)
	{
		return context.users[id].isActive != true && context.users[id].gameStatus != 'QUITTED';
	});
}

/**
 * Get average bid bank. The average of available bids
 * of all the users who atleast joined this game
 *
 * @return {Array}
 */
Jackpot.prototype.getAverageBidBank = function()
{
	var totalAvailableBids = 0;
	var context = this;

	Object.keys(this.users).map(function(id)
	{
		totalAvailableBids += context.users[id].availableBids;
	});

	return Math.round(totalAvailableBids/Object.keys(this.users).length);
}

/**
 * Get all Bid instances for this jackpot regardless user
 *
 * @return {Array}
 */
Jackpot.prototype.getAllBids = function()
{
	var placedBids 	= [],
		userKeys 	= Object.keys(this.users),
		usersLength = userKeys.length,
		userId,
		user;

	if(usersLength > 0)
	{
		for(var i = 0; i < usersLength; i++)
		{
			userId 		= userKeys[i];
			user 		= this.users[userId];
			placedBids.push(user.placedBids);
		}

		placedBids = [].concat.apply([], placedBids);
	}

	return placedBids;
}

/**
 * Get longest bid duration for the jackpot
 *
 * @param  {Boolean} humanReadable
 * @param {Boolean} excludeLast
 * @return {Integer|String|Boolean}
 */
Jackpot.prototype.getLongestBidDuration = function(humanReadable, excludeLast)
{
    if(this.lastBid == null)
    {
        return false;
    }

    var longestBid  = this.getLongestBid(),
        lastBid     = this.lastBid,
        lastBidRTD  = lastBid.getRealTimeDuration(),
        duration,
        time;

    if(longestBid && longestBid.duration > lastBidRTD)
    {
        duration = longestBid.duration;
    }
    else
    {
        duration = lastBidRTD;
    }

    // If exclude last, then ignore last bid
    if(excludeLast)
    {
        duration = longestBid.duration;
    }

    // Send in human readable
    if(typeof humanReadable != 'undefined' && humanReadable == true)
    {
        time = this.convertSecondsToCounterTime(duration);
        return time.minutes + ':' + time.seconds;
    }

    return duration;
}

/**
 * Get longest bid duration
 *
 * @return {Integer}
 */
Jackpot.prototype.getLongestBid = function()
{
	var bids       = this.getAllBids(),
        lastBid    = this.lastBid,
        longestBid;

    if(bids.length <= 0)
    {
        return null;
    }
    else if(bids.length == 1)
    {
        return bids[0];
    }

	longestBid = bids.reduce(function(l, e)
    {
      return e.duration > l.duration ? e : l;
    });

    if(lastBid != null && longestBid.duration > lastBid.getRealTimeDuration())
    {
        return longestBid;
    }
    else
    {
        return lastBid;
    }
}

/**
 * Get last bid
 *
 * @return {Integer}
 */
Jackpot.prototype.getLastBid = function()
{
    var bids = this.getAllBids(),
        sorted;

    sorted = bids.sort(function(a, b)
    {
      return moment(b.startTime).unix() - moment(a.startTime).unix();
    });

    return sorted[0];
}

/**
 * Get last bid duration
 *
 * @param  {Boolean} humanReadable
 * @return {Integer}
 */
Jackpot.prototype.getLastBidDuration = function(humanReadable)
{
    var lastBid     = this.getLastBid(),
        duration    = lastBid.getRealTimeDuration(),
        time;

    if(typeof humanReadable != 'undefined' && humanReadable == true)
    {
        time = this.convertSecondsToCounterTime(duration);
        return time.minutes + ':' + time.seconds;
    }

    return duration;
}

/**
 * Get Jackpot Complete Data
 *
 * @return {Object}
 */
Jackpot.prototype.getJackpotCompleteData = function()
{
    var jackpotUsersIds = Object.keys(this.users),
        jackpotCoreData,
        jackpotUser,
        jackpotUserMetaData,
        jackpotUserBids,
        jackpotUserBidsLength,
        jackpotUsersLength  = jackpotUsersIds.length,
        winnerData          = this.getJackpotWinner(),
        jackpotUserRawData  = [];

    for(var i = 0; i < jackpotUsersLength; i++)
    {
        jackpotUser             = this.users[jackpotUsersIds[i]];
        jackpotUserMetaData     = jackpotUser.getMetaData();
        jackpotUserBids         = jackpotUser.getMyBids(true);
        jackpotUserBidsLength   = jackpotUserBids.length;

        jackpotUserRawData.push({
            userId              : jackpotUserMetaData.id,
            bids                : jackpotUserBids,
            totalBids           : jackpotUserBidsLength,
            availableBids       : jackpotUser.availableBids,
            firstBidStartTime   : jackpotUser.firstBidStartTime,
            lastBidStartTime    : jackpotUser.lastBidStartTime,
            longestBidDuration  : jackpotUser.getMyLongestBidDuration()
        });
    }

    jackpotCoreData     = {
        jackpotId               : this.metaData.id,
        uniqueId                : this.metaData.uniqueId,
        totalUsersParticipated  : jackpotUsersIds.length,
        totalNumberOfBids       : this.getAllBids().length,
        lastBidDuration         : this.getLastBidDuration(),
        longestBidDuration      : this.getLongestBidDuration(false),
        longestBidWinnerUserId  : winnerData.longestBidUser.id,
        lastBidWinnerUserId     : winnerData.lastBidUser.id,
        startedOn               : this.metaData.startedOn ? moment(this.metaData.startedOn).format("YYYY-MM-DD HH:mm:ss") : new Date(),
        finishedOn              : this.metaData.finishedOn ? moment(this.metaData.finishedOn).format("YYYY-MM-DD HH:mm:ss") : new Date()
    }

    return {
        jackpot:    jackpotCoreData,
        users:      jackpotUserRawData,
        winnerData: this.getJackpotWinner()
    };
}

/**
 * Get Jackpot Winner Raw Data
 *
 * @return {Object}
 */
Jackpot.prototype.getJackpotWinner = function()
{
    var longestBid      = this.getLongestBid(),
        lastBidUser     = this.lastBidUser;

    if(longestBid)
    {
        return {
            longestBidUser: longestBid.user,
            lastBidUser:    lastBidUser.getMetaData(),
            bothAreSame:    longestBid.user.id == lastBidUser.getMetaData().id
        }
    }
    else
    {
        return false
    }
}

/**
 * Save Jackpot Data Into DB after game finished
 *
 * @param  {Object} data
 * @param {Function} callback
 * @return {*}
 */
Jackpot.prototype.saveDataIntoDB = function(data, callback)
{
    var jackpotCore = data.jackpot,
        users       = data.users,
        winnerData  = data.winnerData,
        jpWinners   = [],
        context     = this,
        insertData,
        jpUserInstance;

    jackpotCore.JackpotGameUsers = [];

    // Set JackpotGameUsers
    if(users.length > 0)
    {
        for(var k = 0; k < users.length; k++)
        {
            var user, bids, jpUser, jpBids;

            user    = users[k];
            bids    = user.bids;
            jpBids  = [];

            for(var j = 0; j < bids.length; j++)
            {
                jpBids.push({
                    bidStartTime        : bids[j].startTime,
                    bidEndTime          : bids[j].endTime,
                    bidDuration         : bids[j].duration
                });
            }


            jpUserInstance = this.getUser(user.userId);

            jpUser  = {
                remainingAvailableBids      : user.availableBids,
                totalNumberOfBids           : user.totalBids,
                longestBidDuration          : user.longestBidDuration,
                joinedOn                    : user.firstBidStartTime,
                userId                      : user.userId,
                JackpotGameUserBids         : jpBids,
                normalBattleWins            : jpUserInstance.getNormalBattleTotalWins(),
                gamblingBattleWins          : jpUserInstance.getGamblingBattleTotalWins(),
                normalBattleLooses          : jpUserInstance.getNormalBattleTotalLosses(),
                gamblingBattleLooses        : jpUserInstance.getGamblingBattleTotalLosses(),
                normalBattleLongestStreak   : jpUserInstance.getNormalBattleLongestStreak(),
                gamblingBattleLongestStreak : jpUserInstance.getGamblingBattleLongestStreak()
            };

            jackpotCore.JackpotGameUsers.push(jpUser);
        }
    }

    // Setup JackpotGameWinners
    if(winnerData.bothAreSame == true)
    {
        jpWinners.push({
            isLastBidUser       : 1,
            isLongestBidUser    : 1,
            jackpotAmount       : this.metaData.amount,
            winningAmount       : this.metaData.amount,
            userId              : winnerData.lastBidUser.id
        });
    }
    else
    {
        var percentOfLastBid    = parseInt(global.globalSettings['jackpot_setting_last_bid_percent_amount'], 10),
            percentOfLongestBid = parseInt(global.globalSettings['jackpot_setting_longest_bid_percent_amount'], 10);

        jpWinners.push({
            isLastBidUser       : 1,
            isLongestBidUser    : 0,
            jackpotAmount       : this.metaData.amount,
            winningAmount       : parseFloat((this.metaData.amount * percentOfLastBid/100), 10).toFixed(2),
            userId              : winnerData.lastBidUser.id
        });
        jpWinners.push({
            isLastBidUser       : 0,
            isLongestBidUser    : 1,
            jackpotAmount       : this.metaData.amount,
            winningAmount       : parseFloat((this.metaData.amount * percentOfLongestBid/100), 10).toFixed(2),
            userId              : winnerData.longestBidUser.id
        });
    }
    jackpotCore.JackpotGameWinners = jpWinners;

    // Now create the base
    JackpotGameModel.create(jackpotCore,
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

Jackpot.prototype.updateNormalBattleTimer = function()
{
    var battleContainer = this.normalBattleContainer;
    battleContainer.updateTimer();
}

Jackpot.prototype.updateGamblingBattleTimer = function()
{
    var battleContainer = this.gamblingBattleContainer;
    //battleContainer.updateTimer();
}

// Export Jackpot
export default Jackpot;